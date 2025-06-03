"use client";

import { useState } from "react";
import ZombieGame from "../components/ZombieGame";
import StartImg from "@/photo/start.svg";
import zombieImg from "@/photo/zombie.svg";
import BackgroundImg from "@/photo/background.png";

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setGameOver(false);
  };

  const handleGameOver = () => {
    setGameStarted(false);
    setGameOver(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">殭屍別吵我睡覺</h1>
      
      {!gameStarted ? (
        <div className="text-center">
          {gameOver && (
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4">遊戲结束！</h2>
              <p className="text-2xl">最终得分: {score}</p>
            </div>
          )}
          <button
            onClick={startGame}
            className="relative w-48 h-48 transition-transform hover:scale-105"
          >
            <img
              src={StartImg.src}
              alt="开始游戏"
              className="w-full h-full object-contain"
            />
          </button>
        </div>
      ) : (
        <div className="w-full max-w-4xl">
          <div className="flex justify-between mb-4">
            <div className="text-2xl">分數: {score}</div>
          </div>
          
          <ZombieGame 
            onScoreChange={setScore}
            onGameOver={handleGameOver}
          />
          
          <div className="mt-4 text-center">
            <p className="text-lg">點擊工具打擊殭屍！！</p>
          </div>
        </div>
      )}
    </div>
  );
}
