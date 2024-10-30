const NFTMarket = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">NFT Marketplace</h1>
      <p>Browse and purchase NFTs from a variety of collections.</p>
      {/* Implement your marketplace logic here, such as displaying NFTs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Placeholder NFT Items */}
        <div className="bg-gray-800 p-4 rounded-lg">NFT #1</div>
        <div className="bg-gray-800 p-4 rounded-lg">NFT #2</div>
        <div className="bg-gray-800 p-4 rounded-lg">NFT #3</div>
      </div>
    </div>
  );
};

export default NFTMarket;
