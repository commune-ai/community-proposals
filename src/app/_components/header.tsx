"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

import { EllipsisVerticalIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { DarkModeToggle } from "./dark-mode-toggle";
import { PolkadotButton } from "./polkadot-button";
import { covered_by_your_grace } from "~/styles/fonts";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <>
      <div
        className={`fixed left-0 top-0 z-50 h-full w-full backdrop-blur-sm backdrop-brightness-75 ${mobileMenuOpen ? "visible" : "hidden"} animate-menu-fade lg:hidden`}
      >
        <nav className="fixed z-50 h-full w-full shadow-xl">
          <div className="min-w-1/4 sticky right-3 top-3 ml-auto h-auto w-[94%] rounded-lg bg-white p-5 sm:w-[40%] dark:bg-light-dark dark:text-white">
            <div className="flex items-baseline justify-between">
              <div className="flow-root">
                <PolkadotButton />
              </div>
              <div className="flex gap-3">
                <div
                  className={`z-50 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 p-1.5 dark:bg-dark`}
                >
                  <DarkModeToggle />
                </div>
                <button
                  type="button"
                  onClick={toggleMobileMenu}
                  className="z-50 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 p-1.5 dark:bg-dark"
                >
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon className="h-6 w-6 dark:fill-white" />
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>

      <header className="sticky top-0 z-40 flex w-full flex-wrap items-center justify-between bg-white p-4 shadow-md dark:bg-light-dark">
        <Link href="/" className="mr-3 flex flex-shrink-0 items-center gap-3">
          <Image
            src="/logo.svg"
            alt="Community Validator"
            width={35}
            height={35}
          />
          <div className="hidden w-full flex-grow items-center md:w-auto lg:block">
            <div className="flex gap-3 xl:gap-6">
              <h1 className="text-xl font-bold xl:text-2xl dark:text-white">
                <span
                  className={`${covered_by_your_grace.className} text-2xl text-blue-500 xl:text-3xl`}
                >
                  Community{" "}
                </span>
                Proposals.
              </h1>
            </div>
          </div>
        </Link>

        <>
          <div className="hidden md:flex md:flex-row md:gap-3">
            <PolkadotButton />
            <DarkModeToggle />
          </div>
          <div className="col-span-3 ml-auto self-center md:hidden">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="flex h-12 w-12 items-center justify-center rounded-lg dark:bg-dark"
            >
              <span className="sr-only">Open main menu</span>
              <EllipsisVerticalIcon
                className="h-6 w-6 dark:fill-white"
                aria-hidden="true"
              />
            </button>
          </div>
        </>
      </header>
    </>
  );
}
