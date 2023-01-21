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

const Metamask = ({ blockchainNetwork }) => {
  //----------------------------------------------------------------------------
  // Constant variables.
  //----------------------------------------------------------------------------
  const ONBOARD_TEXT = "Click here to install MetaMask!";
  const CONNECT_TEXT = "Connect";
  const CONNECTED_TEXT = "Connected";

  //----------------------------------------------------------------------------
  // Metamask variables.
  //----------------------------------------------------------------------------
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const [metamaskLogin, setMetamaskLogin] = React.useState(false);
  const [metamaskAccountAddress, setMetamaskAccountAddress] =
    React.useState("");
  const [metamaskChainId, setMetamaskChainId] = React.useState("");
  const [metamaskChainName, setMetamaskChainName] = React.useState("n/a");

  //----------------------------------------------------------------------------
  // Handle toast mesage.
  //----------------------------------------------------------------------------
  const [snackbarValue, setSnackbarValue] = React.useState({
    snackbarSeverity: AlertSeverity.info,
    snackbarMessage: "",
    snackbarTime: new Date(),
    snackbarOpen: true,
  });
  const { snackbarSeverity, snackbarMessage, snackbarTime, snackbarOpen } =
    snackbarValue;

  //----------------------------------------------------------------------------
  // Metamask provider variables.
  //----------------------------------------------------------------------------
  const metamaskProvider = React.useRef();
  const onboarding = React.useRef();

  //----------------------------------------------------------------------------
  // Initialize useEffect case.
  //----------------------------------------------------------------------------
  React.useEffect(() => {
    if (!onboarding.current) {
      onboarding.current = new MetaMaskOnboarding();
    }

    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      getMetamaskEthereumProvider();

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
  }, [metamaskProvider.current]);

  //----------------------------------------------------------------------------
  // Get metamask provider and set event listener and
  // call initial event for account and chain.
  //----------------------------------------------------------------------------
  const getMetamaskEthereumProvider = async () => {
    metamaskProvider.current = await detectEthereumProvider({
      mustBeMetaMask: true,
    });

    // Open metamask.
    metamaskProvider.current
      .request({ method: "eth_requestAccounts" })
      .then(handleAccountsChanged)
      .catch((error) => {
        console.error(error);
      });

    // Add event listener.
    metamaskProvider.current.on("accountsChanged", handleAccountsChanged);
    metamaskProvider.current.on("chainChanged", handleChainChanged);
    // metamaskProvider.current.on("disconnect", handleDisconnect);

    handleAccountsChanged();
    handleChainChanged();
  };

  //----------------------------------------------------------------------------
  // Account change case.
  //----------------------------------------------------------------------------
  const handleAccountsChanged = async (accounts) => {
    // console.log("handleAccountsChanged accounts: ", accounts);
    if (accounts) {
      if (accounts.length === 0) {
        // console.log("metamaskConnect false");
        setMetamaskLogin(false);

        // MetaMask is locked or the user has not connected any accounts.
        // console.log("Please connect to MetaMask.");

        // TODO: No account, send user message to make a new account.
      } else if (accounts[0] !== metamaskAccountAddress) {
        setMetamaskAccountAddress(accounts[0]);

        // console.log("metamaskConnect true");
        setMetamaskLogin(true);
      }
    } else {
      // console.log("metamaskConnect false");
      setMetamaskLogin(false);
    }
  };

  //----------------------------------------------------------------------------
  // Chain network change case.
  //----------------------------------------------------------------------------
  const handleChainChanged = async () => {
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
      chainId === blockchainNetwork ||
      getChainName({ chainId: chainId }) === blockchainNetwork
    ) {
      // console.log("metamaskConnect true");
      setMetamaskLogin(true);
    } else {
      // console.log("metamaskConnect false");
      setMetamaskLogin(false);
    }
  };

  //----------------------------------------------------------------------------
  // Disconnect network change case.
  //----------------------------------------------------------------------------
  const handleDisconnect = async () => {
    // console.log("handleDisconnect");
    // console.log("metamaskConnect false");
    setMetamaskLogin(false);
  };

  //----------------------------------------------------------------------------
  // Connect network change case.
  //----------------------------------------------------------------------------
  const connectMetamask = async () => {
    console.log("call connectMetamask()");

    // 1. Get metamask account.
    try {
      metamaskProvider.current
        .request({ method: "eth_requestAccounts" })
        .then(handleAccountsChanged)
        .catch((error) => {
          console.error(error);
          if (error.code === 4001) {
            // EIP-1193 userRejectedRequest error
            // showSnackbar("Please connect to MetaMask.");
            // console.log("Please connect to MetaMask.");
            setSnackbarValue({
              snackbarSeverity: AlertSeverity.error,
              snackbarMessage: "Please connect to Metamask",
              snackbarTime: new Date(),
              snackbarOpen: true,
            });
          } else {
            // showSnackbar(error);
            console.error(error);
            setSnackbarValue({
              snackbarSeverity: AlertSeverity.error,
              snackbarMessage: error.reason,
              snackbarTime: new Date(),
              snackbarOpen: true,
            });
          }
        });

      // 2. Set metamask chain id to mumbai.
      let response;
      console.log("blockchainNetwork: ", blockchainNetwork);
      if (blockchainNetwork === "0x539") {
        response = await switchNetworkLocalhost(metamaskProvider.current);
      } else if (blockchainNetwork === "0x13881") {
        response = await switchNetworkMumbai(metamaskProvider.current);
      } else {
        console.error("No support blockchain network: ", blockchainNetwork);
        response = "error";
      }

      if (response === null) {
        // 3. Set state variables.
        setMetamaskChainId(blockchainNetwork);
        setMetamaskChainName(getChainName({ chainId: blockchainNetwork }));

        // 4. Set true to login state.
        // console.log("metamaskConnect true");
        setMetamaskLogin(true);
      } else {
        // console.log("metamaskConnect false");
        setMetamaskLogin(false);
      }
    } catch (error) {
      // console.log("connectMetamask throw error");
      throw error;
    }
  };

  //----------------------------------------------------------------------------
  // Metamask related functions.
  //----------------------------------------------------------------------------
  const handleMetamaskButtonClick = (event) => {
    // console.log("event: ", event);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      {/*--------------------------------------------------------------------*/}
      {/* Show metamask button.                                              */}
      {/*--------------------------------------------------------------------*/}
      <Button
        aria-describedby={id}
        variant="contained"
        onMouseLeave={handleClose}
        onMouseEnter={async (event) => {
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

      {/*--------------------------------------------------------------------*/}
      {/* Show popover.                                                      */}
      {/*--------------------------------------------------------------------*/}
      <Popover
        sx={{
          pointerEvents: "none",
        }}
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

      {/*--------------------------------------------------------------------*/}
      {/* Snackbar component.                                                */}
      {/*--------------------------------------------------------------------*/}
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
