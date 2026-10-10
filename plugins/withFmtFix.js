/**
 * withFmtFix — works around the `fmt` pod failing to compile on Xcode 26+
 * with: error: call to consteval function
 *   'fmt::basic_format_string<...>' is not a constant expression
 *
 * Root cause: the fmt version pinned by React Native (11.0.2) enables C++20
 * `consteval`, but Apple Clang 26 rejects fmt's consteval constructor. The
 * header's FMT_USE_CONSTEVAL detection has NO `#ifndef` guard, so a
 * `-DFMT_USE_CONSTEVAL=0` compiler flag is silently overwritten — the header
 * file itself must be patched.
 *
 * Fix (applied to the generated ios/Podfile's post_install block on every
 * `expo prebuild`, idempotent via the marker comment):
 *   1. Compile the `fmt` pod target explicitly as C++20.
 *   2. Patch Pods/fmt/include/fmt/base.h so consteval is disabled on ALL
 *      Apple Clang versions (not just < 14): the existing check
 *      `defined(__apple_build_version__) && __apple_build_version__ < 14000029L`
 *      becomes just `defined(__apple_build_version__)`.
 */
const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withFmtFix(config) {
  return withDangerousMod(config, [
    'ios',
    (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        'Podfile'
      );
      let contents = fs.readFileSync(podfilePath, 'utf-8');
      const marker = '# [rtube] fmt Xcode26 consteval fix';
      if (!contents.includes(marker)) {
        const patch = `
  ${marker}
  installer.pods_project.targets.each do |target|
    if target.name == 'fmt'
      target.build_configurations.each do |pod_config|
        pod_config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++20'
      end
    end
  end
  # fmt 11.0.2's FMT_USE_CONSTEVAL has no #ifndef guard, so a -D flag is
  # ignored — patch the header itself to disable consteval on Apple Clang.
  fmt_base = File.join(__dir__, 'Pods', 'fmt', 'include', 'fmt', 'base.h')
  if File.exist?(fmt_base)
    fmt_content = File.read(fmt_base)
    fmt_patched = fmt_content.gsub(
      /defined\\(__apple_build_version__\\) && __apple_build_version__ < \\d+L/,
      'defined(__apple_build_version__)'
    )
    if fmt_patched != fmt_content
      File.chmod(0644, fmt_base)  # fmt headers ship read-only (0444)
      File.write(fmt_base, fmt_patched)
      puts '[rtube] fmt base.h patched: consteval disabled on Apple Clang'
    else
      raise '[rtube] fmt base.h pattern did not match 11.0.2 layout — patch ineffective, aborting loudly'
    end
  else
    raise '[rtube] fmt base.h not found under Pods/fmt — patch ineffective, aborting loudly'
  end
`;
        if (!contents.includes('post_install do |installer|')) {
          throw new Error(
            '[withFmtFix] Could not find `post_install do |installer|` in the generated Podfile'
          );
        }
        contents = contents.replace(
          'post_install do |installer|',
          'post_install do |installer|' + patch
        );
        fs.writeFileSync(podfilePath, contents);
      }
      return config;
    },
  ]);
};
