"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import zombieImg from "@/photo/zombie.svg";
import zombie2Img from "@/photo/zombie2.svg";
import BackgroundImg from "@/photo/background2.png";
import BackpackImg from "@/photo/backpack.svg";
import CalculatorImg from "@/photo/calculator.svg";
import BookImg from "@/photo/book.svg";
import TimeImg from "@/photo/time.svg";

const ZOMBIE_SPEED = 4;
const SPAWN_INTERVAL = 1000;
const BUTTON_WIDTH = 160;
const BUTTON_GAP = 8;

export default function ZombieGame({ onScoreChange, onGameOver }) {
  const [zombies, setZombies] = useState([]);
  const [timeLeft, setTimeLeft] = useState(20);
  const [activeLane, setActiveLane] = useState(null);
  const [gameWidth, setGameWidth] = useState(0);
  const [isSpeedUp, setIsSpeedUp] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const gameContainerRef = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const animationFrameRef = useRef();

  // 计算游戏区域宽度
  useEffect(() => {
    const updateWidth = () => {
      if (gameContainerRef.current) {
        setGameWidth(gameContainerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // 计算每个车道的中心位置
  const getLanePosition = useCallback((lane) => {
    const totalWidth = gameWidth;
    const totalButtonsWidth = BUTTON_WIDTH * 3 + BUTTON_GAP * 2;
    const startX = (totalWidth - totalButtonsWidth) / 2;
    
    switch(lane) {
      case 'left':
        return startX + BUTTON_WIDTH / 2;
      case 'middle':
        return startX + BUTTON_WIDTH + BUTTON_GAP + BUTTON_WIDTH / 2;
      case 'right':
        return startX + BUTTON_WIDTH * 2 + BUTTON_GAP * 2 + BUTTON_WIDTH / 2;
      default:
        return 0;
    }
  }, [gameWidth]);

  // 生成僵尸
  const spawnZombie = useCallback(() => {
    const lanes = ['left', 'middle', 'right'];
    const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
    
    setZombies(prev => [...prev, {
      id: Date.now(),
      lane: randomLane,
      position: 0,
      isSpeedUp: isSpeedUp
    }]);
  }, [isSpeedUp]);

  // 处理射击
  const handleShoot = useCallback((lane) => {
    setActiveLane(lane);
    setTimeout(() => setActiveLane(null), 100);

    setZombies(prev => {
      const hitZombie = prev.find(zombie => 
        zombie.lane === lane && 
        zombie.position > 300 && 
        zombie.position < 600
      );

      if (hitZombie) {
        onScoreChange(prev => prev + 1);
        return prev.filter(z => z.id !== hitZombie.id);
      }
      return prev;
    });
  }, [getLanePosition, onScoreChange]);

  // 游戏计时器
  useEffect(() => {
    if (timeLeft <= 0) {
      onGameOver();
      return;
    }

    if (timeLeft === 10) {
      setShowWarning(true);
      setTimeout(() => {
        setShowWarning(false);
        setIsSpeedUp(true);
      }, 2000);
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onGameOver]);

  // 生成僵尸的定时器
  useEffect(() => {
    const spawnTimer = setInterval(spawnZombie, SPAWN_INTERVAL);
    return () => clearInterval(spawnTimer);
  }, [spawnZombie]);

  // 更新僵尸位置
  useEffect(() => {
    const animate = () => {
      const currentTime = performance.now();
      const deltaTime = (currentTime - lastTimeRef.current) / 16;
      lastTimeRef.current = currentTime;

      setZombies(prev => 
        prev.map(zombie => ({
          ...zombie,
          isSpeedUp: isSpeedUp,
          position: zombie.position + (isSpeedUp ? ZOMBIE_SPEED * 2 : ZOMBIE_SPEED) * deltaTime
        })).filter(zombie => zombie.position < 600)
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isSpeedUp]);

  return (
    <div ref={gameContainerRef} className="relative h-[600px] bg-gray-800 rounded-lg overflow-hidden game-container">
      {/* 背景图片 */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={BackgroundImg.src}
          alt="background"
          className="w-full h-full object-cover blur-xs"
        />
      </div>

      {/* 警告效果 */}
      {showWarning && (
        <div className="absolute inset-0 bg-red-500/30 animate-pulse z-40" />
      )}

      {/* 时间显示 */}
      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-lg">
        <div className="relative w-36 h-36 -translate-y-2">
          <img
            src={TimeImg.src}
            alt="time"
            className="w-full h-full object-contain"
          />
          <span className={`absolute top-1/2 left-1/2 transform -translate-x-4 -translate-y-2.5 text-white text-3xl font-bold ${showWarning ? 'animate-bounce text-red-500' : ''}`}>
            {timeLeft}
          </span>
        </div>
      </div>

      {/* 僵尸 */}
      {zombies.map(zombie => (
        <div
          key={zombie.id}
          className="absolute w-40 h-40 transition-transform"
          style={{
            left: `${getLanePosition(zombie.lane)}px`,
            top: `${zombie.position}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <img
            src={zombie.isSpeedUp ? zombie2Img.src : zombieImg.src}
            alt="zombie"
            className="w-full h-full object-contain"
          />
        </div>
      ))}

      {/* 射击区域 */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 pb-4">
        <button
          onClick={() => handleShoot('left')}
          className={`w-40 h-40 rounded-lg transition-all hover:scale-110 ${
            activeLane === 'left' ? 'ring-4 ring-red-500' : ''
          }`}
        >
          <img
            src={BackpackImg.src}
            alt="backpack"
            className="w-full h-full object-contain p-2"
          />
        </button>
        <button
          onClick={() => handleShoot('middle')}
          className={`w-40 h-40 rounded-lg transition-all hover:scale-110 ${
            activeLane === 'middle' ? 'ring-4 ring-red-500' : ''
          }`}
        >
          <img
            src={CalculatorImg.src}
            alt="calculator"
            className="w-full h-full object-cover p-2"
          />
        </button>
        <button
          onClick={() => handleShoot('right')}
          className={`w-40 h-40 rounded-lg transition-all hover:scale-110 ${
            activeLane === 'right' ? 'ring-4 ring-red-500' : ''
          }`}
        >
          <img
            src={BookImg.src}
            alt="book"
            className="w-full h-full object-contain p-2"
          />
        </button>
      </div>
    </div>
  );
} 