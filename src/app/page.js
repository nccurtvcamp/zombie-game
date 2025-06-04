"use client";

import { useState } from "react";
import ZombieGame from "../components/ZombieGame";
import StartImg from "@/photo/start.svg";
import zombieImg from "@/photo/zombie.svg";
import BackgroundImg from "@/photo/background.png";
import ResultImg from "@/photo/result.svg";

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
      <h1 className="text-4xl font-bold mb-8 relative">
        <span className="relative z-10 block translate-y-10">殭屍別吵我睡覺</span>
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-yellow-500/20 blur-sm translate-y-10"></div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-overlay translate-y-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 translate-y-10"></div>
      </h1>
      
      {!gameStarted ? (
        <div className="text-center">
          {gameOver ? (
            <div className="flex flex-col items-center">
              <div className="relative w-[400px] h-[400px]">
                <img
                  src={ResultImg.src}
                  alt="遊戲結束"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <h2 className="text-3xl font-bold mb-4">遊戲結束！</h2>
                  <p className="text-2xl mb-6">最終得分： {score}</p>
                </div>
              </div>
              <button
                onClick={startGame}
                className="mt-8 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg text-xl transition-colors"
              >
                再玩一次
              </button>
            </div>
          ) : (
            <button
              onClick={startGame}
              className="relative w-48 h-48 transition-transform hover:scale-105"
            >
              <img
                src={StartImg.src}
                alt="開始遊戲"
                className="w-full h-full object-contain"
              />
            </button>
          )}
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
