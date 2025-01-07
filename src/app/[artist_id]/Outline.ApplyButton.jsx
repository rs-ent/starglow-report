import React from 'react';

const ApplyButton = ({ isPre }) => {
  return (
    <button className="button-feather-purple">
      {isPre ? 'PRE APPLY' : 'GET NFT'}
    </button>
  );
};

export default ApplyButton;