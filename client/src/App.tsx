import React, { useEffect, useState } from "react";
import * as CryptoJS from "crypto-js";

const API_URL = "http://localhost:8080";

function App() {
  const [data, setData] = useState<string>();
  const [userKey, setUserKey] = useState<string>("");
  const [timestamp, setTimestamp] = useState<string>("");
  const [hash, setHash] = useState<string>("");

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const { data, timestamp } = await fetchData();
    setData(data);
    setTimestamp(timestamp);
  };

  const fetchData = async () => {
    const response = await fetch(API_URL);
    const { data, timestamp } = await response.json();
    const decryptedData = DataService.decryptData(data, userKey);
    return { data: decryptedData, timestamp };
  };

  const restoreData = async () => {
    const response = await fetch(API_URL + "/restore", { method: "PUT" });
    const { data, timestamp } = await response.json();
    let decryptedData;
    try {
        decryptedData = DataService.decryptData(data, userKey);
    } catch (error) {
        alert("Error restoring data");
        decryptedData = "";
    }
    setData(decryptedData);
    setTimestamp(timestamp);

    // Update hash after restoring data from backup
    const hash = DataService.generateSHA256Hash(decryptedData);
    setHash(hash);
  };

  const updateData = async () => {
    const hash = DataService.generateSHA256Hash(data ?? "");
    setHash(hash);

    const encryptedData = DataService.encryptData(data ?? "", userKey);

    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        data: encryptedData,
        timestamp: new Date().toISOString(),
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    await getData();
  };

  const verifyData = async () => {
    const { data: fetchedData } = await fetchData();
    const fetchedHash = DataService.generateSHA256Hash(fetchedData);
    const dataHash = DataService.generateSHA256Hash(data ?? "");

    let messages = "";
    if (dataHash === fetchedHash) {
      messages += "Frontend data matches backend data.\n";
    } else {
      messages += "Frontend data does not match backend data.\n";
    }

    if (hash === fetchedHash) {
      messages += "Backend data has not been tampered with.\n";
    } else {
      messages += "Backend data has been tampered with.\n";
    }

    alert(messages);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        position: "absolute",
        padding: 0,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: "20px",
        fontSize: "30px",
      }}
    >
      <div>Saved Data</div>
      <input
        style={{ fontSize: "30px" }}
        type="text"
        value={data}
        onChange={(e) => setData(e.target.value)}
      />

      <div>User Key</div>
      <input
        style={{ fontSize: "30px" }}
        type="text"
        value={userKey}
        onChange={(e) => setUserKey(e.target.value)}
      />

      <div style={{ display: "flex", gap: "10px" }}>
        <button style={{ fontSize: "20px" }} onClick={updateData}>
          Update Data
        </button>
        <button style={{ fontSize: "20px" }} onClick={verifyData}>
          Verify Data
        </button>
        <button style={{ fontSize: "20px" }} onClick={restoreData}>
          Restore Data
        </button>
      </div>

      <div>Last Updated At: {timestamp}</div>
      <div>Hash: {hash}</div>
    </div>
  );
}

export default App;

class DataService {
  static encryptData(data: string, userKey: string): string {
    return CryptoJS.AES.encrypt(data, userKey).toString();
  }

  static decryptData(data: string, userKey: string): string {
    try {
        const bytes = CryptoJS.AES.decrypt(data, userKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error("Decryption failed:", error);
        throw error;
    }
  }

  static generateSHA256Hash(data: string): string {
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
  }
}
