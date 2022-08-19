import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

import { ethers } from "ethers";
import React, { useState, useEffect } from "react";
import abi from "../utils/radio.json"

export default function SomethingToSomeone() {
    const [currentAccount, setCurrentAccount] = useState("");
    const contractAddress = "0xFA445a5E3D32880307dD080034115C4F534dbc11"
    const contractABI = abi.abi;
    
  const [message, setMessage] = useState("")
  const [allWaves, setAllWaves] = useState([])
  const [allStations, setAllStations] = useState([])


  const checkIfWalletConnected = async () => {
    try {
      console.log("Checking wallet")
      const { ethereum } = window;


      if (!ethereum) {
        console.log("Make sure you have metamask!");
      } else {
        console.log("We have the ethereum object", ethereum);
        getAllWaves();
        getAllStations();
      }

      /*
     * Check if we're authorized to access the user's wallet
     */
      const accounts = await ethereum.request({ method: "eth_accounts" })
      console.log(accounts)

      if (accounts.length != 0) {
        const account = accounts[0];
        setCurrentAccount(account)
        console.log("Found an authorized account:", account);
      } else {
        console.log("No authorized account found")
      }

    } catch (error) {
      console.log(error)
    }
  }

  const getAllWaves = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI,
          signer)

        const waves = await wavePortalContract.getAllSongs()

        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });
        console.log("All waves", wavesCleaned)

        setAllWaves(wavesCleaned)

      } else {
        console.log("Ethereum object doesn't exist!")
      }

    } catch (error) {
      console.log(error)
    }
  }

  const createStation = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI,
          signer)

        const waveTxn = await wavePortalContract.createStation("Something to Someone")
        console.log("Mining...", waveTxn.hash)

        await waveTxn.wait()
        console.log("Mined -- ", waveTxn.hash)


        const waves = await wavePortalContract.getAllStations()

        let stationsCleaned = [];
        waves.forEach(wave => {
          stationsCleaned.push(
            wave.station
          );
        });
        console.log("All stations", stationsCleaned)
      } else {
        console.log("Ethereum object doesn't exist!")
      }

    } catch (error) {
      console.log(error)
    }

  }

  const getAllStations = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI,
          signer)

        const waves = await wavePortalContract.getAllStations()

        let stationsCleaned = [];
        waves.forEach(wave => {
          stationsCleaned.push(
            wave.station
          );
        });
        console.log("All stations", stationsCleaned)

        setAllStations(stationsCleaned);

      } else {
        console.log("Ethereum object doesn't exist!")
      }

    } catch (error) {
      console.log(error)
    }
  }

  const getMessage = (event) => {
    //console.log(event.target.value)
    setMessage(event.target.value)
  }

  const wave = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI,
          signer)

        let count = await wavePortalContract.getTotalSongs()
        console.log("Retrieved total wave count...", count.toNumber())

        /*
        * Execute the actual wave from your smart contract
        */

        const waveTxn = await wavePortalContract.postSong("Hard Time", "Ning", "https://open.spotify.com/track/5DebUsH4CN4ByTe0xF0KPJ", "This is song #1")
        console.log("Mining...", waveTxn.hash)

        await waveTxn.wait()
        console.log("Mined -- ", waveTxn.hash)

        count = await wavePortalContract.getTotalSongs();
        console.log("Retrieved total wave count...", count.toNumber());

        getAllWaves()


      } else {
        console.log("Ethereum object doesn't exist!")
      }

    } catch (error) {
      console.log(error)
    }

  }

  const connectWallet = async () => {
    try {

      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletConnected()
    console.log("useEffect")
  }, [])

    return (
        <>
        <h3>Something To Someone</h3>
        {(currentAccount == "") ?
        <button className="waveButton" onClick={connectWallet}>
          Connect Wallet
        </button> : <></>
      }

      {allWaves.map((wave, index) => {
        return (
          <div key={index} style={{
            backgroundColor: "OldLace", marginTop: "16px",
            padding: "8px"
          }}>
            <div>Address: {wave.address}</div>
            <div>Time: {wave.timestamp.toString()}</div>
            <div>Message: {wave.message}</div>
          </div>)
      })}</>
    )
}
