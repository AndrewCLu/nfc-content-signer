import React, { useState, ChangeEvent, useEffect } from "react";
// @ts-ignore
import { execHaloCmdWeb } from "@arx-research/libhalo/api/web.js";

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [hashedText, setHashedText] = useState<string>("");
  const [publicKey, setPublicKey] = useState<string>("");
  const [signature, setSignature] = useState<string>("");

  useEffect(() => {
    const computeHash = async (text: string) => {
      if (text) {
        const hash = await utf8ToSha256(text);
        setHashedText(hash);
      } else {
        setHashedText("");
      }
    };

    computeHash(inputText);
  }, [inputText]);

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
  };

  const utf8ToSha256 = async (text: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch (err) {
      alert("Failed to copy!");
    }
  };

  const handleNfcSign = async () => {
    const digest = await utf8ToSha256(inputText);
    let command = {
      name: "sign",
      keyNo: 1,
      digest,
    };

    let res;
    try {
      res = await execHaloCmdWeb(command);
      setPublicKey(res.publicKey);
      setSignature(res.signature.der);
    } catch (e) {
      alert("Error: " + String(e));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 p-2">
      <h1 className="text-xl sm:text-3xl font-bold text-gray-700 mb-4 text-center">
        NFC Content Signer
      </h1>
      <p className="text-sm sm:text-l text-black mb-4 text-center">
        Digitally sign a piece of text with your FIDO2 compliant NFC card. Text
        is UTF-8 encoded and SHA-256 hashed. Must be used on mobile browser.
      </p>
      <textarea
        className="w-full sm:w-1/2 p-2 border-2 border-gray-400 rounded-lg mb-4 text-black"
        style={{ minHeight: "150px" }}
        value={inputText}
        onChange={handleTextChange}
        placeholder="Paste your text here"
      />
      {hashedText && (
        <div className="w-full sm:w-1/2 p-3 border border-gray-400 rounded-lg bg-gray-100 break-words">
          <h2 className="text-md sm:text-lg font-semibold text-gray-700">
            Text Hash
          </h2>
          <p className="text-gray-600 break-all">{hashedText}</p>
          <button
            className="mt-2 px-4 py-1 bg-blue-300 text-white rounded hover:bg-blue-400 transition-colors flex items-center"
            onClick={() => copyToClipboard(hashedText)}
          >
            📋 Copy Hash
          </button>
        </div>
      )}
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        onClick={handleNfcSign}
      >
        Sign with NFC Card
      </button>
      {publicKey && (
        <div className="w-full sm:w-1/2 p-3 border border-gray-400 rounded-lg bg-gray-100 break-words">
          <h2 className="text-md sm:text-lg font-semibold text-gray-700">
            Public Key
          </h2>
          <p className="text-gray-600 break-all">{publicKey}</p>
          <button
            className="mt-2 px-4 py-1 bg-blue-300 text-white rounded hover:bg-blue-400 transition-colors flex items-center"
            onClick={() => copyToClipboard(publicKey)}
          >
            📋 Copy Public Key
          </button>
        </div>
      )}
      {signature && (
        <div className="w-full sm:w-1/2 p-3 border border-gray-400 rounded-lg bg-gray-100 break-words">
          <h2 className="text-md sm:text-lg font-semibold text-gray-700">
            Signature
          </h2>
          <p className="text-gray-600 break-all">{signature}</p>
          <button
            className="mt-2 px-4 py-1 bg-blue-300 text-white rounded hover:bg-blue-400 transition-colors flex items-center"
            onClick={() => copyToClipboard(signature)}
          >
            📋 Copy Signature
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
