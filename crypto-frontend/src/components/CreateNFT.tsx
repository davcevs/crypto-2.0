import { useState } from "react";
// import { generateNFT } from "generative-art-nft"; // Example package

const CreateNFT = () => {
  const [nftData, setNftData] = useState(null);

  const handleCreateNFT = () => {
    const nft = generateNFT({
      name: "User's NFT",
      description: "A generative NFT created by a user",
      size: 500, // Example size
    });
    setNftData(nft);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Create Your NFT</h1>
      <p>Create your own unique NFT by clicking the button below.</p>
      <button
        onClick={handleCreateNFT}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Generate NFT
      </button>

      {nftData && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4">Your NFT:</h2>
          <img
            src={nftData.image}
            alt="Generated NFT"
            className="w-full max-w-xs"
          />
          <p className="mt-2">{nftData.description}</p>
        </div>
      )}
    </div>
  );
};

export default CreateNFT;
