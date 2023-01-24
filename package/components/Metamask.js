import React from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import MetaMaskOnboarding from "@metamask/onboarding";
import { Popover, Typography, Button, Portal } from "@mui/material";
import AccountBoxRoundedIcon from "@mui/icons-material/AccountBoxRounded";
import {
  switchNetworkMumbai,
  switchNetworkLocalhost,
  ConnectStatus,
  RBSnackbar,
  AlertSeverity,
  shortenAddress,
  getChainName,
} from "./RentMarketUtil";

const Metamask = ({ inputBlockchainNetwork }) => {
  // * -------------------------------------------------------------------------
  // * Constant variables.
  // * -------------------------------------------------------------------------
  const ONBOARD_TEXT = "Click here to install MetaMask!";
  const CONNECT_TEXT = "Connect";
  const CONNECTED_TEXT = "Connected";

  // * -------------------------------------------------------------------------
  // * Metamask variables.
  // * -------------------------------------------------------------------------
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const [metamaskLogin, setMetamaskLogin] = React.useState(false);
  const [metamaskAccountAddress, setMetamaskAccountAddress] =
    React.useState("");
  const [metamaskChainId, setMetamaskChainId] = React.useState("");
  const [metamaskChainName, setMetamaskChainName] = React.useState("n/a");

  // * -------------------------------------------------------------------------
  // * Handle toast mesage.
  // * -------------------------------------------------------------------------
  const [snackbarValue, setSnackbarValue] = React.useState({
    snackbarSeverity: AlertSeverity.info,
    snackbarMessage: "",
    snackbarTime: new Date(),
    snackbarOpen: true,
  });
  const { snackbarSeverity, snackbarMessage, snackbarTime, snackbarOpen } =
    snackbarValue;

  // * -------------------------------------------------------------------------
  // * Metamask provider variables.
  // * -------------------------------------------------------------------------
  const metamaskProvider = React.useRef();
  const onboarding = React.useRef();

  // * -------------------------------------------------------------------------
  // * Initialize useEffect case.
  // * -------------------------------------------------------------------------
  React.useEffect(() => {
    // console.log("call useEffect()");

    async function initialize() {
      if (!onboarding.current) {
        onboarding.current = new MetaMaskOnboarding();
      }

      if (MetaMaskOnboarding.isMetaMaskInstalled()) {
        await getMetamaskEthereumProvider();

        return () => {
          // TODO: Remove event listener.
          // metamaskProvider.current.removeListener(
          //   "accountsChanged",
          //   handleAccountsChanged
          // );
          // metamaskProvider.current.removeListener(
          //   "chainChanged",
          //   handleChainChanged
          // );
          // metamaskProvider.current.removeListener("disconnect", handleDisconnect);
        };
      } else {
        // console.log("metamaskConnect false");
        setMetamaskLogin(false);
      }
    }
    initialize();
  }, [metamaskProvider.current]);

  // * -------------------------------------------------------------------------
  // * Get metamask provider and set event listener and
  // * call initial event for account and chain.
  // * -------------------------------------------------------------------------
  async function getMetamaskEthereumProvider() {
    // console.log("call getMetamaskEthereumProvider()");

    metamaskProvider.current = await detectEthereumProvider({
      mustBeMetaMask: true,
    });

    // * Open metamask.
    try {
      const accounts = await metamaskProvider.current.request({
        method: "eth_requestAccounts",
      });
      handleAccountsChanged(accounts);
      handleChainChanged();
    } catch (error) {
      console.error(error);
    }

    // * Add event listener.
    metamaskProvider.current.on("accountsChanged", handleAccountsChanged);
    metamaskProvider.current.on("chainChanged", handleChainChanged);
    // metamaskProvider.current.on("disconnect", handleDisconnect);
  }

  // * -------------------------------------------------------------------------
  // * Account change case.
  // * -------------------------------------------------------------------------
  async function handleAccountsChanged(accounts) {
    // console.log("call handleAccountsChanged()");
    // console.log("accounts: ", accounts);

    if (accounts) {
      if (accounts.length === 0) {
        // console.log("metamaskConnect false");
        setMetamaskLogin(false);
      } else if (accounts[0] !== metamaskAccountAddress) {
        // console.log("accounts: ", accounts);
        // console.log("accounts[0]: ", accounts[0]);
        setMetamaskAccountAddress((prevState) => accounts[0]);
      }
    } else {
      // console.log("metamaskConnect false");
      setMetamaskLogin(false);
    }
  }

  // * -------------------------------------------------------------------------
  // * Chain network change case.
  // * -------------------------------------------------------------------------
  async function handleChainChanged() {
    // console.log("handleChainChanged");
    const chainId = await metamaskProvider.current.request({
      method: "eth_chainId",
    });

    if (chainId !== metamaskChainId) {
      // console.log("chainId: ", chainId);
      setMetamaskChainId(chainId);
      setMetamaskChainName(getChainName({ chainId }));
    }

    // * Compare blockchain network id case or name case.
    if (
      chainId === inputBlockchainNetwork ||
      getChainName({ chainId: chainId }) === inputBlockchainNetwork
    ) {
      // console.log("metamaskConnect true");
      setMetamaskLogin(true);
    } else {
      // console.log("metamaskConnect false");
      setMetamaskLogin(false);
    }
  }

  // * -------------------------------------------------------------------------
  // * Disconnect network change case.
  // * -------------------------------------------------------------------------
  async function handleDisconnect() {
    // console.log("handleDisconnect");
    // console.log("metamaskConnect false");
    setMetamaskLogin(false);
  }

  // * -------------------------------------------------------------------------
  // * Connect network change case.
  // * -------------------------------------------------------------------------
  async function connectMetamask() {
    // console.log("call connectMetamask()");

    // * Get metamask account.
    try {
      const accounts = metamaskProvider.current.request({
        method: "eth_requestAccounts",
      });
      handleAccountsChanged(accounts);
    } catch (error) {
      if (error.code === 4001) {
        // EIP-1193 userRejectedRequest error
        // console.log("Please connect to MetaMask.");
        setSnackbarValue({
          snackbarSeverity: AlertSeverity.error,
          snackbarMessage: "Please connect to Metamask",
          snackbarTime: new Date(),
          snackbarOpen: true,
        });
      } else {
        setSnackbarValue({
          snackbarSeverity: AlertSeverity.error,
          snackbarMessage: error.reason,
          snackbarTime: new Date(),
          snackbarOpen: true,
        });
      }
      throw error;
    }

    // * Set metamask chain id to the preset blockchain network.
    let response;
    // console.log("inputBlockchainNetwork: ", inputBlockchainNetwork);
    if (getChainName({ chainId: inputBlockchainNetwork }) === "localhost") {
      response = await switchNetworkLocalhost(metamaskProvider.current);
    } else if (
      getChainName({ chainId: inputBlockchainNetwork }) === "maticmum"
    ) {
      response = await switchNetworkMumbai(metamaskProvider.current);
    } else {
      console.error("No support blockchain network: ", inputBlockchainNetwork);
      response = "error";
    }

    if (response === null) {
      // * Set state variables.
      setMetamaskChainId(inputBlockchainNetwork);
      setMetamaskChainName(getChainName({ chainId: inputBlockchainNetwork }));

      // * Set true to login state.
      // console.log("metamaskConnect true");
      setMetamaskLogin(true);
    } else {
      // console.log("metamaskConnect false");
      setMetamaskLogin(false);
    }
  }

  // * -------------------------------------------------------------------------
  // * Metamask related functions.
  // * -------------------------------------------------------------------------
  function handleMetamaskButtonClick(event) {
    // console.log("event: ", event);
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <div>
      {/* // * --------------------------------------------------------------*/}
      {/* // * Show metamask button.                                         */}
      {/* // * --------------------------------------------------------------*/}
      <Button
        aria-describedby={id}
        variant="contained"
        onClick={async (event) => {
          if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            // console.log("metamaskLogin: ", metamaskLogin);
            if (metamaskLogin === true) {
              handleMetamaskButtonClick(event);
            } else if (metamaskProvider.current) {
              try {
                await connectMetamask();
              } catch (error) {
                // console.log("connectMetamask error: ", error);
                console.error(error);
                setSnackbarValue({
                  snackbarSeverity: AlertSeverity.error,
                  snackbarMessage: error.message,
                  snackbarTime: new Date(),
                  snackbarOpen: true,
                });
              }
            } else {
              await getMetamaskEthereumProvider();
            }
          } else {
            onboarding.current.startOnboarding();
          }
        }}
        color={metamaskLogin ? "success" : "error"}
        endIcon={metamaskLogin ? <AccountBoxRoundedIcon /> : <></>}
      >
        {metamaskLogin
          ? CONNECTED_TEXT
          : metamaskProvider.current
          ? CONNECT_TEXT
          : ONBOARD_TEXT}
      </Button>

      {/* // * --------------------------------------------------------------*/}
      {/* // * Show popover.                                                 */}
      {/* // * --------------------------------------------------------------*/}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        disableRestoreFocus
      >
        <Typography sx={{ p: 2 }}>
          Account : {shortenAddress(metamaskAccountAddress, 20)} <br /> Chain :{" "}
          {metamaskChainName}
        </Typography>
      </Popover>

      {/* // * --------------------------------------------------------------*/}
      {/* // * Snackbar component.                                           */}
      {/* // * --------------------------------------------------------------*/}
      <RBSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        currentTime={snackbarTime}
      />
    </div>
  );
};

export default Metamask;
