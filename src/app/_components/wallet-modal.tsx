"use client";

import Image from "next/image";
import React, { useState } from "react";

import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { type InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { toast } from "react-toastify";
import { getCurrentTheme } from "~/styles/theming";

export function WalletModal({
  open,
  wallets,
  setOpen,
  handleWalletSelections,
}: {
  open: boolean;
  setOpen: (args: boolean) => void;
  wallets: InjectedAccountWithMeta[];
  handleWalletSelections: (arg: InjectedAccountWithMeta) => void;
}) {
  const theme = getCurrentTheme();

  const [selectedAccount, setSelectedAccount] =
    useState<InjectedAccountWithMeta>();

  return (
    <div
      role="dialog"
      className={`fixed inset-0 z-[100] ${open ? "block" : "hidden"} animate-fade-in-down`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-dark opacity-80" />

      {/* Modal */}
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <div className="relative w-[100%] max-w-3xl transform overflow-hidden rounded-3xl border-2 border-zinc-800 bg-white text-left shadow-custom dark:border-white dark:bg-light-dark dark:shadow-custom-dark">
            {/* Modal Header */}
            <div className="flex flex-col items-center justify-between gap-3 border-b-2 border-zinc-800 bg-[url(/grids.svg)] bg-cover bg-center bg-no-repeat p-6 md:flex-row dark:border-white">
              <div className="flex flex-col items-center md:flex-row">
                <Image
                  src="/polkadot-logo.svg"
                  alt="Module Logo"
                  width={32}
                  height={32}
                />

                <h3
                  className="pl-2 text-xl font-bold leading-6 dark:text-white"
                  id="modal-title"
                >
                  Select Wallet
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-2xl border-2 border-black p-2 transition duration-200 dark:border-white dark:bg-light-dark hover:dark:bg-dark"
              >
                <XMarkIcon className="h-6 w-6 dark:fill-white" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex flex-col gap-y-4 overflow-y-auto p-6">
              {wallets.map((item) => (
                <button
                  key={item.address}
                  onClick={() => setSelectedAccount(item)}
                  className={`text-md flex cursor-pointer items-center gap-x-3 overflow-auto rounded-xl border-2 p-5 shadow-white dark:text-white ${selectedAccount === item ? "border-green-500" : "border-black dark:border-white "}`}
                >
                  <CheckCircleIcon
                    className={`h-6 w-6 ${
                      selectedAccount === item
                        ? "fill-green-500"
                        : "fill-black dark:fill-white"
                    }`}
                  />
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-semibold">{item.meta.name}</span>
                    <span>{item.address}</span>
                  </div>
                </button>
              ))}
              {!wallets.length && (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-sm text-gray-500">
                  <div>No wallet found.</div>
                  <div>
                    Please install Polkadot extension or check permission
                    settings.
                  </div>
                  <a
                    href="https://polkadot.js.org/extension/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600"
                  >
                    Install Extension
                  </a>
                </div>
              )}
              <button
                className="w-full rounded-xl border-2 border-orange-500 p-4 text-xl font-semibold text-orange-500"
                onClick={() => {
                  if (!selectedAccount) {
                    toast.error("No account selected", {
                      theme: theme === "dark" ? "dark" : "light",
                    });
                    return;
                  }
                  handleWalletSelections(selectedAccount);
                }}
              >
                Connect Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
