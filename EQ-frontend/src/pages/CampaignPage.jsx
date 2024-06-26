import React, { useState, useEffect } from "react";
import UseAuth from "../hooks/UseAuth";
import LoadingSpinner from "../components/LoadingSpinner";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { IoIosAddCircleOutline } from "react-icons/io";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./CampaignPage.css";

import { campaignTypes } from "../hooks/Countries";

const animatedComponents = makeAnimated();

const CampaignTypesSelect = ({ data, setData }) => {
  const handleChange = (selectedOptions) => {
    setData(selectedOptions);
  };

  const options = data.map((campaignType) => ({
    label: campaignType.label,
    value: campaignType.value,
  }));

  return (
    <Select
      closeMenuOnSelect={false}
      components={animatedComponents}
      defaultValue={options[0]}
      options={options}
      onChange={handleChange}
    />
  );
};

const CampaignCardItem = ({
  type,
  id,
  image,
  creationDate,
  score,
  totalQuiz,
}) => {
  const handleNavigation = () => {
    window.location.href = `/campaign/:${id}/play`;
  };
  const date = new Date(creationDate);
  const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  creationDate = formattedDate;

  const categoryLabel =
    campaignTypes.find((a) => a.value === type)?.label || "Unknown";

  return (
    <div className="campaign-card" onClick={handleNavigation}>
      <h2 className="campaign-card-title">{categoryLabel}</h2>
      <div className="campaign-card-image">
        <img src={image} alt={type} />
      </div>
      <div className="campaign-card-content">
        <div className="campaign-card-details">
          <p className="creation-date">
            <b>Creation Date:</b> {creationDate}
          </p>
          <div className="progress-bar">
            <p className="score">
              <b>Score:</b> {score}
            </p>
            <p className="percent">
              {totalQuiz !== 0 ? <b>{(score / totalQuiz) * 10}%</b> : <b>0%</b>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CampaignPage = () => {
  const notify = (message, type = "info") => {
    toast[type](message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      newestOnTop: false,
      closeOnClick: true,
      rtl: false,
      pauseOnFocusLoss: true,
      draggable: true,
      pauseOnHover: true,
      theme: "dark",
    });
  };
  const [selectedCampaignType, setSelectedCampaignType] = useState(
    campaignTypes[0]
  );
  const [yourCampaigns, setYourCampaigns] = useState([]);
  const { token } = UseAuth();
  const [loading, setLoading] = useState(true);

  const handleAddCampaign = async (selectedType) => {
    try {
      const apiUrl = `${
        import.meta.env.VITE_REACT_USER_API_URL
      }/api/campaigns/${selectedType.value}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        data.score = 0;
        data.totalQuiz = 0;
        setYourCampaigns([...yourCampaigns, data]);
        notify(
          <>
            Campaign <span style={{ color: "green" }}>added</span> to your list.
          </>,
          "success"
        );
      }
    } catch (error) {
      console.error("Error adding campaign:", error);
      setLoading(false);
    }
  };

  const fetchDataCampaigns = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_USER_API_URL}/api/accounts/profile`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setYourCampaigns(data.campaigns);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataCampaigns();
  }, [token]);

  return (
    <>
      <div className="toast">
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </div>
      <div className="campaign-page">
        <div className="campaign-title">
          <h3>Campaign</h3>
        </div>
        <div className="div-nw">
          <CampaignTypesSelect
            data={campaignTypes}
            setData={setSelectedCampaignType}
          />
          <button
            className="new-campaign"
            onClick={() => handleAddCampaign(selectedCampaignType)}
          >
            <IoIosAddCircleOutline />
            <p className="add-campaign">Add new campaign</p>
          </button>
        </div>

        <div className="your-campaigns">
          <h2>Your campaigns</h2>
        </div>
        <div className="list-content">
          <div className="campaing-list">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                {yourCampaigns.map((campaign, index) => (
                  <CampaignCardItem
                    key={index}
                    type={campaign.category}
                    image={"./images/dummy_card.png"}
                    id={campaign.id}
                    creationDate={campaign.creationTime}
                    score={campaign.score}
                    totalQuiz={campaign.totalQuiz}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CampaignPage;
