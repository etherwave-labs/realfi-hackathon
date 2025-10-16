import { InitWaaPOptions } from "@silk-wallet/silk-wallet-sdk"

export const waapConfig: InitWaaPOptions = {
  useStaging: false, // Production environment is more stable
  config: {
    allowedSocials: ["google"],
    authenticationMethods: ["email", "social"],
    styles: {
      darkMode: false,
    },
  },
  project: {
    entryTitle: "Welcome to EventChain",
  },
}
