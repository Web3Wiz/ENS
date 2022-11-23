import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { ethers, providers } from "ethers";
import { useEffect, useRef, useState } from "react";
import { _toEscapedUtf8String } from "ethers/lib/utils";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [ens, setENS] = useState("");
  const [address, setAddress] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [inputAddress, setInputAddress] = useState("");
  const web3ModalRef = useRef();

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet().then((signerAddress) => {
        if (signerAddress != "") {
          getENS(signerAddress).then((_ens) => {
            if (_ens != "") setENS(_ens);
            else setAddress(signerAddress);
          });
        }
      });
    }
  }, [walletConnected]);

  const getENS = async (signerAddress) => {
    const web3provider = await getProviderOrSigner();
    let _ens = "";
    try {
      _ens = await web3provider.lookupAddress(signerAddress);
      return _ens;
    } catch (error) {
      console.error(error);
      return "";
    }
  };
  const showENS = async () => {
    try {
      const _ens = await getENS(inputAddress);
      if (_ens) window.alert("ENS for your entered address is : " + _ens);
      else window.alert("There is no ENS set for your wallet address.");
    } catch (error) {
      console.error(error);
      window.alert(error.error.message);
    }
  };
  const connectWallet = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      if (address != "") {
        setWalletConnected(true);
      }
      return address;
    } catch (error) {
      console.error(error);
      return "";
    }
  };
  const getProviderOrSigner = async (needSigner = false) => {
    const currentProvider = await web3ModalRef.current.connect();
    const web3provider = new providers.Web3Provider(currentProvider);

    const { chainId } = await web3provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Please connect to goerli network");
      throw new Error("Please connect to goerli network");
    }

    return needSigner ? web3provider.getSigner() : web3provider;
  };

  return (
    <div>
      <Head>
        <title>Ethereum Name Service DAPP</title>
        <meta name="description" content="Ethereum Name Service DAPP" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div style={{ minWidth: "50%" }}>
          <div style={{ textAlign: "center" }}>
            <h3 className={styles.title}>
              Welcome to <br />
              The Ethereum Name Service!
            </h3>
            {walletConnected ? (
              <div>
                <h4>
                  {ens == "" ? "Your Address: " + address : "Your ENS: " + ens}
                </h4>
                <div className={styles.description}>
                  You can enter the address below and check its ENS name
                  <input
                    type="text"
                    placeholder="Enter eth address"
                    onChange={async (e) => {
                      setInputAddress(e.target.value);
                    }}
                    className={styles.input}
                  />
                  <button className={styles.button} onClick={showENS}>
                    Check ENS
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <button onClick={connectWallet} className={styles.button}>
                  Connect your wallet
                </button>
              </div>
            )}
          </div>
        </div>
        <div>
          <img className={styles.image} src="./main_img.png" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Kazim&#169;
      </footer>
    </div>
  );
}
