# RTube — Mac-less publish guide (Codemagic -> TestFlight)

You have no Mac. This is the exact path used for the PTUBE app, adapted for
the Expo (React Native) project.

## One-time setup

1. **GitHub repo**
   - Create a **private** repo named `RTube-iOS` under `Jayesh504188`.
   - Push this folder (the `ios/` folder is gitignored - never commit it).

2. **Apple Developer**
   - Register the Bundle ID `com.jayesh504188.rtube` at
     developer.apple.com -> Identifiers (App ID description "RTube").
   - Create the app record in App Store Connect (name "RTube").

3. **Codemagic**
   - Add the app, connect the `RTube-iOS` repo.
   - In App settings -> Environment variables, add the group
     `app_store_credentials` with the SAME variables you already use for PTUBE:
     `BUNDLE_ID` (= `com.jayesh504188.rtube`), `APP_STORE_ID`,
     `APP_STORE_CONNECT_ISSUER_ID`, `APP_STORE_CONNECT_KEY_IDENTIFIER`,
     `APP_STORE_CONNECT_PRIVATE_KEY`, `CERTIFICATE_PRIVATE_KEY`
     (all Secure). You can reuse the existing API key / certificate key -
     nothing app-specific in them.

## Every release

1. Push to `main`.
2. In Codemagic, start the **RTube iOS Release** workflow.
   It runs: verify vars -> `npm ci` -> `expo prebuild --clean` ->
   `pod install` -> code signing -> build IPA -> upload to App Store Connect.
3. The build lands on TestFlight automatically (`submit_to_testflight: true`).
4. Install via the TestFlight app on the iPhone and test.

## Notes

- First build takes ~10-15 min (pods + prebuild). Later builds are faster.
- If a build fails at "Fetch signing files", the API key or certificate key
  variable is missing/empty - re-check the `app_store_credentials` group.
- To submit to App Review later, flip `submit_to_app_store: true` in
  `codemagic.yaml`.
