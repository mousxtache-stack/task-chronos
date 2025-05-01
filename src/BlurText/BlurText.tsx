import React, { useState, useEffect, useRef } from 'react';
import './blurText.css';

type BlurTextProps = {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  onAnimationComplete?: () => void;
};

const BlurText: React.FC<BlurTextProps> = ({
  text = "",
  delay = 150,
  className = "",
  animateBy = "words",
  direction = "top",
  onAnimationComplete,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elements = animateBy === "words" ? text.split(" ") : text.split("");
  const animationEndCount = useRef(0);
  
  useEffect(() => {
    setIsVisible(true);
    
    // Backup pour s'assurer que onAnimationComplete est appelé
    const totalElements = elements.length;
    const timer = setTimeout(() => {
      if (onAnimationComplete) onAnimationComplete();
    }, (totalElements * delay) + 1000); // +1000ms pour être sûr
    
    return () => clearTimeout(timer);
  }, [elements.length, delay, onAnimationComplete]);
  
  const handleAnimationEnd = () => {
    animationEndCount.current += 1;
    if (animationEndCount.current >= elements.length && onAnimationComplete) {
      onAnimationComplete();
    }
  };
  
  return (
    <div className="blur-text-container">
      <div className={`flex flex-wrap ${className}`}>
        {elements.map((element, index) => (
          <span
            key={index}
            className={`blur-text-element inline-block ${isVisible ? 'animate' : ''} ${direction}`}
            style={{ 
              animationDelay: `${index * delay}ms`,
            }}
            onAnimationEnd={handleAnimationEnd}
          >
            {element === " " ? "\u00A0" : element}
            {animateBy === "words" && index < elements.length - 1 && "\u00A0"}
          </span>
        ))}
      </div>
    </div>
  );
};

export default BlurText;
