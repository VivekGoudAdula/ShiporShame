import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { getContract, CONTRACT_ADDRESS } from '../utils/contract';

export enum Status { Active, Shipped, Failed }

export interface Commitment {
  id: number;
  creator: string;
  description: string;
  stakeAmount: bigint;
  deadline: number;
  status: Status;
}

const DEMO_COMMITMENTS_BASE: Commitment[] = [
  {
    id: 1,
    creator: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    description: "Ship the Monad dApp UI",
    stakeAmount: ethers.parseEther("0.5"),
    deadline: Math.floor(Date.now() / 1000) + 3600,
    status: Status.Active
  },
  {
    id: 2,
    creator: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    description: "Write Solidity smart contract",
    stakeAmount: ethers.parseEther("1.2"),
    deadline: Math.floor(Date.now() / 1000) - 1000,
    status: Status.Shipped
  },
  {
    id: 3,
    creator: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    description: "Implement wallet connection",
    stakeAmount: ethers.parseEther("0.2"),
    deadline: Math.floor(Date.now() / 1000) - 5000,
    status: Status.Failed
  }
];

export const useContract = (signer: ethers.Signer | null, provider: ethers.Provider | null) => {
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [rewardPool, setRewardPool] = useState<bigint>(0n);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDemoMode = CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000";
  // Keep demo state between fetches
  const demoStateRef = useRef<{ commitments: Commitment[]; rewardPool: bigint } | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const fetchData = useCallback(async () => {
    if (!provider || isDemoMode) {
      // Demo Mode — use persisted demo state if available
      const base = demoStateRef.current ?? {
        commitments: DEMO_COMMITMENTS_BASE,
        rewardPool: ethers.parseEther("4.5")
      };
      setCommitments([...base.commitments]);
      setRewardPool(base.rewardPool);
      return;
    }

    try {
      const contract = await getContract(provider);
      const [allCommitments, pool] = await Promise.all([
        contract.getAllCommitments(),
        contract.getRewardPoolBalance()
      ]);

      const formatted: Commitment[] = allCommitments.map((c: any) => ({
        id: Number(c.id),
        creator: c.creator,
        description: c.description,
        stakeAmount: c.stakeAmount,
        deadline: Number(c.deadline),
        status: Number(c.status)
      }));

      setCommitments(formatted.reverse());
      setRewardPool(pool);
    } catch (err) {
      console.error("Fetch error:", err);
      // Don't set error here to avoid disrupting UI on background refresh
    }
  }, [provider, isDemoMode]);

  const commit = async (description: string, durationMinutes: number, stakeAmount: string) => {
    if (!signer && !isDemoMode) throw new Error("Please connect your wallet first");

    setLoading(true);
    setError(null);

    if (isDemoMode) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        // Simulate adding new commitment to demo state
        const newId = (demoStateRef.current?.commitments.length ?? DEMO_COMMITMENTS_BASE.length) + 1;
        const newCommitment: Commitment = {
          id: newId,
          creator: signer ? await signer.getAddress() : "0xDEMO000000000000000000000000000000000001",
          description,
          stakeAmount: ethers.parseEther(stakeAmount),
          deadline: Math.floor(Date.now() / 1000) + durationMinutes * 60,
          status: Status.Active
        };
        const base = demoStateRef.current ?? { commitments: DEMO_COMMITMENTS_BASE, rewardPool: ethers.parseEther("4.5") };
        demoStateRef.current = {
          commitments: [newCommitment, ...base.commitments],
          rewardPool: base.rewardPool
        };
      } finally {
        setLoading(false);
        await fetchData();
      }
      return;
    }

    try {
      const contract = await getContract(signer!);
      const tx = await contract.commit(description, durationMinutes * 60, {
        value: ethers.parseEther(stakeAmount)
      });
      await tx.wait();
      await fetchData();
    } catch (err: any) {
      const msg = err.reason || err.shortMessage || err.message || "Transaction failed";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const markShipped = async (id: number) => {
    if (!signer && !isDemoMode) throw new Error("Please connect your wallet first");

    setLoading(true);
    setError(null);

    if (isDemoMode) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const base = demoStateRef.current ?? { commitments: DEMO_COMMITMENTS_BASE, rewardPool: ethers.parseEther("4.5") };
        demoStateRef.current = {
          ...base,
          commitments: base.commitments.map(c =>
            c.id === id ? { ...c, status: Status.Shipped } : c
          )
        };
      } finally {
        setLoading(false);
        await fetchData();
      }
      return;
    }

    try {
      const contract = await getContract(signer!);
      const tx = await contract.markShipped(id);
      await tx.wait();
      await fetchData();
    } catch (err: any) {
      const msg = err.reason || err.shortMessage || err.message || "Transaction failed";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const triggerFail = async (id: number) => {
    if (!signer && !isDemoMode) throw new Error("Please connect your wallet first");

    setLoading(true);
    setError(null);

    if (isDemoMode) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const base = demoStateRef.current ?? { commitments: DEMO_COMMITMENTS_BASE, rewardPool: ethers.parseEther("4.5") };
        const failedCommitment = base.commitments.find(c => c.id === id);
        demoStateRef.current = {
          commitments: base.commitments.map(c =>
            c.id === id ? { ...c, status: Status.Failed } : c
          ),
          rewardPool: base.rewardPool + (failedCommitment?.stakeAmount ?? 0n)
        };
      } finally {
        setLoading(false);
        await fetchData();
      }
      return;
    }

    try {
      const contract = await getContract(signer!);
      const tx = await contract.triggerFail(id);
      await tx.wait();
      await fetchData();
    } catch (err: any) {
      const msg = err.reason || err.shortMessage || err.message || "Transaction failed";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    commitments,
    rewardPool,
    loading,
    error,
    clearError,
    commit,
    markShipped,
    triggerFail,
    refresh: fetchData
  };
};
