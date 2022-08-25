import React from "react";
import Blockies from "react-blockies";

interface IBlockie {
  address: string;
  scale: any;
}
const Blockie: React.FC<IBlockie> = ({ address, scale }) => {
  return (
    <>
      <div className="blockies">
        <Blockies seed={address?.toLowerCase()} size={scale} />
      </div>
    </>
  );
};

export default Blockie;
