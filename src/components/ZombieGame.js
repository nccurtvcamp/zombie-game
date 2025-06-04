"use client";

import { useState, useEffect, useCallback } from 'react';
import zombieImg from "@/photo/zombie.svg";
import BackgroundImg from "@/photo/background.png";
import BackpackImg from "@/photo/backpack.svg";
import CalculatorImg from "@/photo/calculator.svg";
import BookImg from "@/photo/book.svg";
import TimeImg from "@/photo/time.svg";

const ZOMBIE_SPEED = 4;
const SPAWN_INTERVAL = 1000;
const BUTTON_WIDTH = 160;
const BUTTON_GAP = 8;

// 粒子效果组件
const ParticleEffect = ({ x, y, onComplete }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // 创建不同类型的粒子
    const newParticles = [];
    for (let i = 0; i < 15; i++) { // 减少粒子数量
      const angle = (Math.random() * Math.PI * 2);
      const speed = 2 + Math.random() * 3;
      const size = 6 + Math.random() * 8;
      const type = Math.random() < 0.3 ? 'spark' : Math.random() < 0.6 ? 'smoke' : 'flesh';
      
      newParticles.push({
        id: i,
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        type,
        life: 1,
      });
    }
    setParticles(newParticles);

    let animationFrame;
    const animate = () => {
      setParticles(prev => {
        const updated = prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.05,
          life: p.life - 0.1,
        })).filter(p => p.life > 0);

        if (updated.length === 0) {
          onComplete();
          return [];
        }
        return updated;
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [onComplete]);

  return (
    <div className="absolute" style={{ left: x, top: y }}>
      {particles.map(p => (
        <div
          key={p.id}
          className={`absolute rounded-full ${
            p.type === 'spark' ? 'bg-yellow-400' :
            p.type === 'smoke' ? 'bg-gray-400' :
            'bg-red-500'
          }`}
          style={{
            width: p.size,
            height: p.size,
            left: p.x,
            top: p.y,
            opacity: p.life,
            transform: `scale(${p.life})`,
          }}
        />
      ))}
    </div>
  );
};

export default function ZombieGame({ onScoreChange, onGameOver }) {
  const [zombies, setZombies] = useState([]);
  const [timeLeft, setTimeLeft] = useState(20);
  const [activeLane, setActiveLane] = useState(null);
  const [gameWidth, setGameWidth] = useState(0);
  const [particleEffects, setParticleEffects] = useState([]);

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
        zombie.position > 300 && 
        zombie.position < 600
      );

      if (hitZombie) {
        // 添加粒子效果
        const effectId = Date.now();
        setParticleEffects(prev => [...prev, {
          id: effectId,
          x: getLanePosition(hitZombie.lane),
          y: hitZombie.position,
        }]);
        
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

  // 更新僵尸位置
  useEffect(() => {
    let lastTime = performance.now();
    const moveZombies = () => {
      const currentTime = performance.now();
      const deltaTime = (currentTime - lastTime) / 16; // 标准化到16ms
      lastTime = currentTime;

      setZombies(prev => 
        prev.map(zombie => ({
          ...zombie,
          position: zombie.position + ZOMBIE_SPEED * deltaTime
        })).filter(zombie => zombie.position < 600)
      );

      requestAnimationFrame(moveZombies);
    };

    const animationFrame = requestAnimationFrame(moveZombies);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // 生成僵尸的定时器
  useEffect(() => {
    const spawnTimer = setInterval(spawnZombie, SPAWN_INTERVAL);
    return () => clearInterval(spawnTimer);
  }, [spawnZombie]);

  // 清理僵尸
  useEffect(() => {
    const cleanupTimer = setInterval(() => {
      setZombies(prev => prev.filter(zombie => zombie.position < 600));
    }, 1000);

    return () => clearInterval(cleanupTimer);
  }, []);

  return (
    <div className="relative h-[600px] bg-gray-800 rounded-lg overflow-hidden game-container">
      {/* 背景图片 */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={BackgroundImg.src}
          alt="background"
          className="w-full h-full object-cover blur-xs"
        />
      </div>

      {/* 时间显示 */}
      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-lg">
        <div className="relative w-36 h-36 -translate-y-2">
          <img
            src={TimeImg.src}
            alt="time"
            className="w-full h-full object-contain"
          />
          <span className="absolute top-1/2 left-1/2 transform -translate-x-4 -translate-y-2.5 text-white text-3xl font-bold">
            {timeLeft}
          </span>
        </div>
      </div>

      {/* 粒子效果 */}
      {particleEffects.map(effect => (
        <ParticleEffect
          key={effect.id}
          x={effect.x}
          y={effect.y}
          onComplete={() => {
            setParticleEffects(prev => prev.filter(p => p.id !== effect.id));
          }}
        />
      ))}

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