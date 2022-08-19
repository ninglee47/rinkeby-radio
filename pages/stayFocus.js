import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

import { ethers } from "ethers";
import React, { useState, useEffect } from "react";
import abi from "../utils/radio.json"

import { useForm } from "react-hook-form";

export async function getServerSideProps() {
  // Fetch data from external API
  const res = await fetch('http://localhost:6060/getToken')
  const data = await res.json()
  const token = data.message.access_token
  return {props: {token}}
}

export default function StayFocus({token}) {
  const [currentAccount, setCurrentAccount] = useState("");
  const contractAddress = "0xFA445a5E3D32880307dD080034115C4F534dbc11"
  const contractABI = abi.abi;

  const [allWaves, setAllWaves] = useState([])

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const onSubmit = data => wave(data);

  console.log(watch("name")); // watch input value by passing the name of it


  const checkIfWalletConnected = async () => {
    try {
      console.log("Checking wallet")
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
      } else {
        console.log("We have the ethereum object", ethereum);
        getAllWaves();
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
            name: wave.name,
            song: wave.link,
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

  const wave = async (data) => {
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
        
        console.log(data)
        const waveTxn = await wavePortalContract.postSong("Stay Focus", data.name, data.link, data.message)
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
      //getToken()
    }, [])

    return (
        <>
        <h3>Stay Focus</h3>
        <div>Spotify token {token}</div>
        {(currentAccount == "") ?
        <button className="waveButton" onClick={connectWallet}>
          Connect Wallet
        </button> : <></>
        }

       {/* "handleSubmit" will validate your inputs before invoking "onSubmit" */}
       <form onSubmit={handleSubmit(onSubmit)}>
         {/* register your input into the hook by invoking the "register" function */}
         <div>Name</div>
         <input {...register("name", { required: true })} />
         {errors.name && <span>This field is required</span>}
         
         <div>Spotify Link</div>
         <input {...register("link", { required: true })} />
         {errors.link && <span>This field is required</span>}

         <div>Message</div>
         <input {...register("message")} />

         <div><input type="submit" /></div>
       </form>

      {allWaves.map((wave, index) => {
        return (
          <div key={index} style={{
            backgroundColor: "OldLace", marginTop: "16px",
            padding: "8px"
          }}>
            <div>Address: {wave.address}</div>
            <div>Time: {wave.timestamp.toString()}</div>
            <div>Name: {wave.name}</div>
            <div>Song: {wave.song}</div>
            <div>Message: {wave.message}</div>
          </div>)
      })}
      </>
    )
}
