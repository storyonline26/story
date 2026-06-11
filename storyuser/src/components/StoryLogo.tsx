import React from "react";
import "./StoryLogo.css";

const StoryLogo: React.FC = () => {
  return (
    <span className="story-logo" aria-hidden="true">
      <span className="story-logo__title">STORY</span>
      <span className="story-logo__tagline">WRITE YOUR OWN FASHION</span>
    </span>
  );
};

export default StoryLogo;
