/**
 * withFmtFix — works around the `fmt` pod failing to compile on Xcode 26+
 * with: error: call to consteval function
 *   'fmt::basic_format_string<...>' is not a constant expression
 *
 * Root cause: the fmt version pinned by React Native uses C++20 `consteval`,
 * but Xcode builds pods as C++17 by default and newer Apple Clang is strict
 * about consteval in non-C++20 translation units.
 *
 * Fix: compile just the `fmt` pod target as C++20 and disable fmt's consteval
 * path (FMT_USE_CONSTEVAL=0) so it falls back to constexpr. Both are
 * documented community fixes for this exact error; together they are harmless.
 *
 * Applied to the generated ios/Podfile's post_install block on every
 * `expo prebuild` (idempotent via the marker comment).
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
        defs = pod_config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] || ['$(inherited)']
        defs = [defs] unless defs.is_a?(Array)
        defs << 'FMT_USE_CONSTEVAL=0' unless defs.include?('FMT_USE_CONSTEVAL=0')
        pod_config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] = defs
      end
    end
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
