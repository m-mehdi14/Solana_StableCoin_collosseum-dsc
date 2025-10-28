import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { program } from "@/anchor/setup";
import { PublicKey } from "@solana/web3.js";
import { useTransactionToast } from "./toast";

const InitializeConfig = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [checking, setChecking] = useState(true);
  
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();
  const { showTransactionToast } = useTransactionToast();

  // Check if config is already initialized
  useEffect(() => {
    const checkConfig = async () => {
      if (!connected) {
        setChecking(false);
        return;
      }

      try {
        const [configAccount] = PublicKey.findProgramAddressSync(
          [Buffer.from("config")],
          program.programId
        );

        const accountInfo = await connection.getAccountInfo(configAccount);
        setIsInitialized(accountInfo !== null);
      } catch (err) {
        console.error("Error checking config:", err);
        setIsInitialized(false);
      } finally {
        setChecking(false);
      }
    };

    checkConfig();
  }, [connected, connection]);

  const handleInitialize = async () => {
    if (!publicKey || !connected) {
      setError("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Find config account PDA
      const [configAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("config")],
        program.programId
      );

      // Find mint account PDA
      const [mintAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("mint")],
        program.programId
      );

      console.log("Initializing config account:", configAccount.toString());
      console.log("Mint account:", mintAccount.toString());

      // Initialize config
      const tx = await program.methods
        .initializeConfig()
        .accounts({
          authority: publicKey,
          configAccount: configAccount,
          mintAccount: mintAccount,
          tokenProgram: new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"),
          systemProgram: PublicKey.default,
        })
        .transaction();

      const transactionSignature = await sendTransaction(tx, connection, {
        skipPreflight: true,
        maxRetries: 3,
      });

      console.log("Config initialized! Transaction signature:", transactionSignature);
      showTransactionToast(transactionSignature);
      setSuccess(true);
      setError("");

    } catch (err: any) {
      console.error("Error initializing config:", err);
      setError(err.message || "Failed to initialize config");
    } finally {
      setIsLoading(false);
    }
  };

  if (!connected) {
    return (
      <Alert className="border-warning/50 bg-warning/10">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="text-warning">Wallet Not Connected</AlertTitle>
        <AlertDescription className="text-warning/80">
          Please connect your wallet to initialize the config account.
        </AlertDescription>
      </Alert>
    );
  }

  if (checking) {
    return (
      <Alert className="border-info/50 bg-info/10">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="text-info">Checking Status</AlertTitle>
        <AlertDescription className="text-info/80">
          Checking if config account is initialized...
        </AlertDescription>
      </Alert>
    );
  }

  if (isInitialized || success) {
    return (
      <Alert className="border-success/50 bg-success/10">
        <CheckCircle className="h-4 w-4" />
        <AlertTitle className="text-success">Config Ready!</AlertTitle>
        <AlertDescription className="text-success/80">
          The config account is initialized. You can now deposit and mint stablecoins.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Alert className="border-info/50 bg-info/10">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="text-info">Initialize Required</AlertTitle>
        <AlertDescription className="text-info/80">
          The config account needs to be initialized before you can deposit and mint stablecoins.
          This only needs to be done once.
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive" className="border-danger/50 bg-danger/10">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-danger">Error</AlertTitle>
          <AlertDescription className="text-danger/80">{error}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleInitialize}
        disabled={isLoading}
        className="w-full primary-button"
      >
        {isLoading ? "Initializing..." : "Initialize Config Account"}
      </Button>
    </div>
  );
};

export default InitializeConfig;
