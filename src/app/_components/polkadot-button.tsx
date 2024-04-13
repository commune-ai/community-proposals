import Image from "next/image";
import { usePolkadot } from "~/hooks/polkadot";
import { Squares2X2Icon, WalletIcon } from "@heroicons/react/20/solid";

export function PolkadotButton() {
  const { handleConnect, isInitialized, selectedAccount } = usePolkadot();

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center">
        <Squares2X2Icon className="h-6 w-6 animate-spin fill-orange-500" />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleConnect}
      disabled={!isInitialized}
      className="relative inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-orange-500 bg-white px-4 py-2 shadow-custom-orange active:top-1 active:shadow-custom-orange-clicked dark:bg-light-dark"
    >
      {selectedAccount ? (
        <span className="flex gap-3 font-medium text-orange-500">
          <WalletIcon className="h-6 w-6" />
          <p>{selectedAccount.address.slice(0, 8)}...</p>
        </span>
      ) : (
        <span className="flex gap-3 font-medium text-orange-500">
          <Image
            src="/polkadot-logo.svg"
            alt="Polkadot"
            width={24}
            height={24}
          />
          <p>Connect Wallet</p>
        </span>
      )}
    </button>
  );
}
