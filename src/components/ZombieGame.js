"use client";

import { useState, useEffect, useCallback } from 'react';
import zombieImg from "@/photo/zombie.svg";
import BackgroundImg from "@/photo/background.png";
import BackpackImg from "@/photo/backpack.svg";
import CalculatorImg from "@/photo/calculator.svg";
import BookImg from "@/photo/book.svg";



const ZOMBIE_SPEED = 4;
const SPAWN_INTERVAL = 1000;
const BUTTON_WIDTH = 160; // 从96px增加到160px
const BUTTON_GAP = 8; // gap-2 = 8px

export default function ZombieGame({ onScoreChange, onGameOver }) {
  const [zombies, setZombies] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [activeLane, setActiveLane] = useState(null);
  const [gameWidth, setGameWidth] = useState(0);

  // 计算游戏区域宽度
  useEffect(() => {
    const updateWidth = () => {
      const gameElement = document.querySelector('.game-container');
      if (gameElement) {
        setGameWidth(gameElement.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // 计算每个车道的中心位置
  const getLanePosition = (lane) => {
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
  };

  // 生成僵尸
  const spawnZombie = useCallback(() => {
    const lanes = ['left', 'middle', 'right'];
    const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
    
    const newZombie = {
      id: Date.now(),
      lane: randomLane,
      position: 0,
    };
    
    setZombies(prev => [...prev, newZombie]);
  }, []);

  // 处理射击
  const handleShoot = (lane) => {
    setActiveLane(lane);
    setTimeout(() => setActiveLane(null), 100);

    setZombies(prev => {
      const hitZombie = prev.find(zombie => 
        zombie.lane === lane && 
        zombie.position > 400 && 
        zombie.position < 500
      );

      if (hitZombie) {
        onScoreChange(prev => prev + 1);
        return prev.filter(z => z.id !== hitZombie.id);
      }
      return prev;
    });
  };

  // 处理键盘输入
  useEffect(() => {
    const handleKeyPress = (e) => {
      const key = e.key.toLowerCase();
      const laneMap = {
        'a': 'left',
        's': 'middle',
        'd': 'right'
      };

      if (laneMap[key]) {
        handleShoot(laneMap[key]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // 游戏计时器
  useEffect(() => {
    if (timeLeft <= 0) {
      onGameOver();
      return;
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
    const moveZombies = setInterval(() => {
      setZombies(prev => 
        prev.map(zombie => ({
          ...zombie,
          position: zombie.position + ZOMBIE_SPEED
        })).filter(zombie => zombie.position < 600)
      );
    }, 16);

    return () => clearInterval(moveZombies);
  }, []);

  return (
    <div className="relative h-[600px] bg-gray-800 rounded-lg overflow-hidden game-container">
      {/* 背景图片 */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
        <img
          src={BackgroundImg.src}
          alt="background"
          className="w-[90%] h-[90%] object-contain blur-sm"
        />
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
            src={zombieImg.src}
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
            activeLane === 'left' ? 'ring-4 ring-blue-500' : ''
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
            activeLane === 'middle' ? 'ring-4 ring-blue-500' : ''
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
            activeLane === 'right' ? 'ring-4 black-500' : ''
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