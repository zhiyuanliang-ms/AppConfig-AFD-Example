import React from "react";
import { useState, useEffect, useContext } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { trackEvent } from "@microsoft/feature-management-applicationinsights-browser";
import { AppContext } from "./AppContext";

function Home() {
  const { appInsights, config, featureManager, currentUser, lastRefresh } = useContext(AppContext);
  const [liked, setLiked] = useState(false);
  const [message, setMessage] = useState(undefined);
  const [variant, setVariant] = useState(undefined);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // Array of prepared quotes
  const quotes = [
    {
      text: "You cannot change what you are, only what you do.",
      author: "Philip Pullman"
    },
    {
      text: "The only way to do great work is to love what you do.",
      author: "Steve Jobs"
    },
    {
      text: "Life is what happens to you while you're busy making other plans.",
      author: "John Lennon"
    }
  ];

  useEffect(() => {
    const init = async () => {  
      setMessage(config?.get("Message"));
      const variant = await featureManager?.getVariant("Greeting", { userId: currentUser });
      setVariant(variant);
      setLiked(false);
    };

    init();
  }, [config, featureManager, currentUser, lastRefresh]);

  const handleClick = () => {
    if (!liked) {
      const targetingId = currentUser;
      trackEvent(appInsights, targetingId, { name: "Like" });
    }
    setLiked(!liked);
  };

  const handleNextQuote = () => {
    // Generate a random index different from the current one
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * quotes.length);
    } while (newIndex === currentQuoteIndex && quotes.length > 1);
    
    config.refresh();
    setCurrentQuoteIndex(newIndex);
    setLiked(false); // Reset like status for new quote
  };

  return (
    <div className="quote-card">
      { variant ?
        ( 
        <>
          <h2>{message}</h2>
          <h2>
            { variant.name === "On" ? 
              ( <>Hi <b>{currentUser ?? "Guest"}</b>, hope this makes your day!</> ) :
              ( <>Quote of the day</> ) }
          </h2>
          <blockquote>
            <p>"{quotes[currentQuoteIndex].text}"</p>
            <footer>— {quotes[currentQuoteIndex].author}</footer>
          </blockquote>
          <div className="heart-container">
            <button className="heart-button" onClick={handleClick}>
              {liked ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>
          <div className="quote-controls">
            <button className="next-quote-button" onClick={handleNextQuote}>
              Next Quote
            </button>
          </div>
        </> 
        ) 
        : <p>Loading</p>       
      }
    </div>
  );
}

export default Home;