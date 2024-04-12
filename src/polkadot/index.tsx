/* eslint-disable @typescript-eslint/no-misused-promises */
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import { ApiPromise, WsProvider } from "@polkadot/api";

import {
  type InjectedAccountWithMeta,
  type InjectedExtension,
} from "@polkadot/extension-inject/types";

import { WalletModal } from "~/app/_components/wallet-modal";
import { get_all_stake_out, get_proposals, type StakeData } from "~/chain_queries";
import { handle_custom_proposals } from "~/proposals";
import type { ProposalState } from "~/types";
import { is_not_null } from "~/utils";

interface AddVoting {
  vote: boolean;
  proposalId: number;
  callback?: () => void;
}

interface PolkadotApiState {
  web3Accounts: (() => Promise<InjectedAccountWithMeta[]>) | null;
  web3Enable: ((appName: string) => Promise<InjectedExtension[]>) | null;
  web3FromAddress: ((address: string) => Promise<InjectedExtension>) | null;
}

interface PolkadotContextType {
  api: ApiPromise | null;
  isConnected: boolean;
  isInitialized: boolean;

  blockNumber: number;
  accounts: InjectedAccountWithMeta[];
  selectedAccount: InjectedAccountWithMeta | undefined;

  proposals: ProposalState[] | null;
  stake_data: StakeData | null;

  handleConnect: () => void;
  addVoting: (args: AddVoting) => void;
  createNewProposal: (args: string) => void;
}

const PolkadotContext = createContext<PolkadotContextType | undefined>(
  undefined,
);

interface PolkadotProviderProps {
  children: React.ReactNode;
  wsEndpoint: string;
}

export const PolkadotProvider: React.FC<PolkadotProviderProps> = ({
  children,
  wsEndpoint,
}) => {
  const [api, setApi] = useState<ApiPromise | null>(null);

  const [polkadotApi, setPolkadotApi] = useState<PolkadotApiState>({
    web3Enable: null,
    web3Accounts: null,
    web3FromAddress: null,
  });

  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState(false);
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [blockNumber, setBlockNumber] = useState(0);

  const [proposals, setProposals] = useState<ProposalState[] | null>(null);
  const [stakeData, setStakeData] = useState<StakeData | null>(null);

  const [openModal, setOpenModal] = useState(false);

  async function loadPolkadotApi() {
    const { web3Accounts, web3Enable, web3FromAddress } = await import(
      "@polkadot/extension-dapp"
    );
    setPolkadotApi({
      web3Accounts,
      web3Enable,
      web3FromAddress,
    });
    const provider = new WsProvider(wsEndpoint);
    const newApi = await ApiPromise.create({ provider });
    setApi(newApi);
    setIsInitialized(true);
  }

  useEffect(() => {
    void loadPolkadotApi();

    return () => {
      void api?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsEndpoint]);

  useEffect(() => {
    // console.log("useEffect for wsEndpoint", wsEndpoint); // DEBUG
  }, [wsEndpoint]);

  useEffect(() => {
    // console.log("useEffect for api", api); // DEBUG
    if (api) {
      void api.rpc.chain.subscribeNewHeads((header) => {
        setBlockNumber(header.number.toNumber());
      });

      get_all_stake_out(api).then((stake_data_result) => {
        setStakeData(stake_data_result);
        console.log("got stake map");
      }).catch((e) => {
        console.error("Error fetching stake out map", e);
      });

      get_proposals(api)
        .then((proposals_result) => {
          setProposals(proposals_result);

          handle_custom_proposals(proposals_result,
            // (id, new_proposal) => {
            //   if (proposals == null) {
            //     console.error(`New proposal ${id} is null`); // Should not happen
            //     return;
            //   }
            //   const new_proposal_list = [...proposals];
            //   new_proposal_list[id] = new_proposal;
            //   setProposals(new_proposal_list);
            // }
          ).then((results) => {
            // Handle data from custom proposals
            const new_proposal_list: ProposalState[] = [...proposals_result];
            // For each custom data result, find the proposal with the same id
            // and update its `custom_data` field
            results.filter(is_not_null).forEach((result) => {
              const { id, custom_data } = result;
              const proposal = new_proposal_list.find((p) => p.id === id);
              if (proposal == null) {
                console.error(`Proposal ${id} not found`);
                return;
              }
              proposal.custom_data = custom_data;
            });
            // Update the state with the new proposal list
            setProposals(new_proposal_list);
          }).catch((e) => {
            console.error("Error fetching custom proposals data:", e);
          });
        })
        .catch((e) => {
          console.error("Error fetching proposals:", e);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  async function handleConnect() {
    if (!polkadotApi.web3Enable || !polkadotApi.web3Accounts) return;
    const extensions = await polkadotApi.web3Enable("Community Validator");
    if (!extensions) {
      // TODO: this seems agressive?
      throw Error("NO_EXTENSION_FOUND");
    }
    const allAccounts = await polkadotApi.web3Accounts();
    setAccounts(allAccounts);
    setOpenModal(true);
  }

  const [selectedAccount, setSelectedAccount] =
    useState<InjectedAccountWithMeta>();

  async function handleWalletSelections(wallet: InjectedAccountWithMeta) {
    setSelectedAccount(wallet);
    setIsConnected(true);
    setOpenModal(false);
  }

  async function addVoting({ vote, proposalId, callback }: AddVoting) {
    if (
      !api ||
      !selectedAccount ||
      !polkadotApi.web3FromAddress ||
      !api.tx.subspaceModule?.voteProposal
    )
      return;

    const injector = await polkadotApi.web3FromAddress(selectedAccount.address);
    api.tx.subspaceModule
      .voteProposal(proposalId, vote)
      .signAndSend(selectedAccount.address, { signer: injector.signer })
      .then((response) => {
        console.log("Vote Submitted");
        console.log(response);
        callback?.();
      })
      .catch((err) => {
        // TODO toast error
        console.log(err);
      });
  }

  async function createNewProposal(data: string) {
    if (
      !api ||
      !selectedAccount ||
      !polkadotApi.web3FromAddress ||
      !api.tx.subspaceModule?.addCustomProposal
    )
      return;

    const injector = await polkadotApi.web3FromAddress(selectedAccount.address);
    api.tx.subspaceModule
      .addCustomProposal(data)
      .signAndSend(selectedAccount.address, { signer: injector.signer })
      .then(() => {
        window.location.reload();
      })
      .catch((err) => {
        // TODO toast error
        console.log(err);
      });
  }

  return (
    <PolkadotContext.Provider
      value={{
        api,
        isConnected,
        isInitialized,

        accounts,
        blockNumber,
        selectedAccount,

        proposals,
        stake_data: stakeData,

        addVoting,
        handleConnect,
        createNewProposal,
      }}
    >
      <WalletModal
        open={openModal}
        setOpen={setOpenModal}
        wallets={accounts}
        handleWalletSelections={handleWalletSelections}
      />
      {children}
    </PolkadotContext.Provider>
  );
};

export const usePolkadot = (): PolkadotContextType => {
  const context = useContext(PolkadotContext);
  if (context === undefined) {
    throw new Error("usePolkadot must be used within a PolkadotProvider");
  }
  return context;
};
