/**
 * App Context - Global State Management
 * Purpose: Manage app-wide state including wheels, settings, and data
 * Extend: Add cloud sync, offline storage, user accounts
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Default color palette for wheel options
const DEFAULT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
  '#A3E4D7', '#F9E79F', '#FADBD8', '#D5DBDB', '#AED6F1',
  '#A9DFBF', '#F4D03F', '#E8DAEF', '#D1F2EB', '#FCF3CF',
  '#EBDEF0', '#D6EAF8', '#D5F4E6', '#FDEAA7', '#FADBD8'
];

const AppContext = createContext();

const STORAGE_KEYS = {
  WHEELS: '@minidecider_wheels',
  SETTINGS: '@minidecider_settings',
  RNG_CONFIG: '@minidecider_rng_config',
  COIN_STATS: '@minidecider_coin_stats',
  SPIN_RESULTS: '@minidecider_spin_results',
};

const DEFAULT_SETTINGS = {
  hapticsEnabled: true,
  defaultSpinDuration: 4,
  onboardingCompleted: false,
};

const DEFAULT_RNG_CONFIG = {
  min: 1,
  max: 100,
  count: 1,
  allowDuplicates: true,
  lastResults: [],
};

const DEFAULT_COIN_STATS = {
  heads: 0,
  tails: 0,
  lastResult: null,
  lastFlippedAt: null,
};

// Preset wheels that are created for new users
const PRESET_WHEELS = [
  {
    id: 'preset-what-to-eat',
    name: 'What to Eat',
    emoji: '🍽️',
    pinned: false,
    options: [
      { id: '1', label: 'Pizza', color: '#FF9E80', weight: 50, enabled: true },
      { id: '2', label: 'Burger', color: '#FFCC80', weight: 50, enabled: true },
      { id: '3', label: 'Pasta', color: '#FFF176', weight: 50, enabled: true },
      { id: '4', label: 'Sushi', color: '#AED581', weight: 50, enabled: true },
      { id: '5', label: 'Steak', color: '#80CBC4', weight: 50, enabled: true },
      { id: '6', label: 'Salad', color: '#81D4FA', weight: 50, enabled: true },
      { id: '7', label: 'Chicken stir-fry', color: '#90CAF9', weight: 50, enabled: true },
      { id: '8', label: 'Roast Beef', color: '#CE93D8', weight: 50, enabled: true },
      { id: '9', label: 'Tacos', color: '#F48FB1', weight: 50, enabled: true },
      { id: '10', label: 'Fish and chips', color: '#FFAB91', weight: 50, enabled: true },
      { id: '11', label: 'BBQ Ribs', color: '#FF3B30', weight: 50, enabled: true },
    ],
    favorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'preset-yes-no',
    name: 'Yes or No',
    emoji: '🤷',
    pinned: false,
    options: [
      { id: '1', label: 'Yes', color: '#00C853', weight: 50, enabled: true },
      { id: '2', label: 'No', color: '#FF3B30', weight: 50, enabled: true },
    ],
    favorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'preset-board-games',
    name: 'Board Games',
    emoji: '🎲',
    pinned: false,
    options: [
      { id: '1', label: 'Monopoly', color: '#FF9E80', weight: 50, enabled: true },
      { id: '2', label: 'Chess', color: '#FFCC80', weight: 50, enabled: true },
      { id: '3', label: 'Scrabble', color: '#FFF176', weight: 50, enabled: true },
      { id: '4', label: 'Catan', color: '#AED581', weight: 50, enabled: true },
      { id: '5', label: 'Ticket to Ride', color: '#80CBC4', weight: 50, enabled: true },
      { id: '6', label: 'Risk', color: '#81D4FA', weight: 50, enabled: true },
      { id: '7', label: 'Pandemic', color: '#90CAF9', weight: 50, enabled: true },
      { id: '8', label: 'Cluedo', color: '#CE93D8', weight: 50, enabled: true },
      { id: '9', label: 'Carcassonne', color: '#F48FB1', weight: 50, enabled: true },
      { id: '10', label: 'Twilight Struggle', color: '#FFAB91', weight: 50, enabled: true },
    ],
    favorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'preset-what-to-do',
    name: 'What to Do Today',
    emoji: '🌟',
    pinned: false,
    options: [
      { id: '1', label: 'Go for a walk', color: '#FF9E80', weight: 50, enabled: true },
      { id: '2', label: 'Read a book', color: '#FFCC80', weight: 50, enabled: true },
      { id: '3', label: 'Watch a movie', color: '#FFF176', weight: 50, enabled: true },
      { id: '4', label: 'Visit a museum', color: '#AED581', weight: 50, enabled: true },
      { id: '5', label: 'Try a new recipe', color: '#80CBC4', weight: 50, enabled: true },
      { id: '6', label: 'Exercise', color: '#81D4FA', weight: 50, enabled: true },
      { id: '7', label: 'Meet a friend for coffee', color: '#90CAF9', weight: 50, enabled: true },
      { id: '8', label: 'Do some gardening', color: '#CE93D8', weight: 50, enabled: true },
      { id: '9', label: 'Visit a local market', color: '#F48FB1', weight: 50, enabled: true },
      { id: '10', label: 'Go shopping', color: '#FFAB91', weight: 50, enabled: true },
      { id: '11', label: 'Take a day trip to a nearby city', color: '#FF3B30', weight: 50, enabled: true },
    ],
    favorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'preset-color',
    name: 'Color',
    emoji: '🎨',
    pinned: false,
    options: [
      { id: '1', label: 'Red', color: '#FF3B30', weight: 50, enabled: true },
      { id: '2', label: 'Orange', color: '#FF6D00', weight: 50, enabled: true },
      { id: '3', label: 'Yellow', color: '#FFD600', weight: 50, enabled: true },
      { id: '4', label: 'Green', color: '#00C853', weight: 50, enabled: true },
      { id: '5', label: 'Teal', color: '#00BFA5', weight: 50, enabled: true },
      { id: '6', label: 'Blue', color: '#00B0FF', weight: 50, enabled: true },
      { id: '7', label: 'Indigo', color: '#2979FF', weight: 50, enabled: true },
      { id: '8', label: 'Purple', color: '#651FFF', weight: 50, enabled: true },
      { id: '9', label: 'Magenta', color: '#D500F9', weight: 50, enabled: true },
      { id: '10', label: 'Pink', color: '#FF4081', weight: 50, enabled: true },
      { id: '11', label: 'Coral', color: '#FF9E80', weight: 50, enabled: true },
      { id: '12', label: 'Peach', color: '#FFAB91', weight: 50, enabled: true },
    ],
    favorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'preset-100-challenge',
    name: '100 Challenge',
    emoji: '💯',
    pinned: false,
    options: Array.from({ length: 100 }, (_, i) => ({
      id: (i + 1).toString(),
      label: (i + 1).toString(),
      color: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      weight: 50,
      enabled: true,
    })),
    favorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'preset-where-to-travel',
    name: 'Where to Travel',
    emoji: '✈️',
    pinned: false,
    options: [
      { id: '1', label: 'Paris', color: '#FF9E80', weight: 50, enabled: true },
      { id: '2', label: 'New York', color: '#FFCC80', weight: 50, enabled: true },
      { id: '3', label: 'Barcelona', color: '#FFF176', weight: 50, enabled: true },
      { id: '4', label: 'Rome', color: '#AED581', weight: 50, enabled: true },
      { id: '5', label: 'Kyoto', color: '#80CBC4', weight: 50, enabled: true },
      { id: '6', label: 'Queenstown', color: '#81D4FA', weight: 50, enabled: true },
      { id: '7', label: 'Cape Town', color: '#90CAF9', weight: 50, enabled: true },
      { id: '8', label: 'Sydney', color: '#CE93D8', weight: 50, enabled: true },
      { id: '9', label: 'Istanbul', color: '#F48FB1', weight: 50, enabled: true },
      { id: '10', label: 'Banff', color: '#FFAB91', weight: 50, enabled: true },
      { id: '11', label: 'Hong Kong', color: '#FF3B30', weight: 50, enabled: true },
    ],
    favorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'preset-gift-girlfriend',
    name: 'Gift for My Girlfriend',
    emoji: '💝',
    pinned: false,
    options: [
      { id: '1', label: 'Jewelry', color: '#FF9E80', weight: 50, enabled: true },
      { id: '2', label: 'Designer handbag', color: '#FFCC80', weight: 50, enabled: true },
      { id: '3', label: 'Perfume', color: '#FFF176', weight: 50, enabled: true },
      { id: '4', label: 'Spa package', color: '#AED581', weight: 50, enabled: true },
      { id: '5', label: 'Makeup set', color: '#80CBC4', weight: 50, enabled: true },
      { id: '6', label: 'Flowers and chocolate', color: '#81D4FA', weight: 50, enabled: true },
      { id: '7', label: 'Luxury skincare products', color: '#90CAF9', weight: 50, enabled: true },
      { id: '8', label: 'A romantic getaway', color: '#CE93D8', weight: 50, enabled: true },
      { id: '9', label: 'Concert tickets', color: '#F48FB1', weight: 50, enabled: true },
    ],
    favorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'preset-gift-boyfriend',
    name: 'Gift for My Boyfriend',
    emoji: '🎁',
    pinned: false,
    options: [
      { id: '1', label: 'Wrist Watch', color: '#FF9E80', weight: 50, enabled: true },
      { id: '2', label: 'Personalized Wallet', color: '#FFCC80', weight: 50, enabled: true },
      { id: '3', label: 'Hobby Related Item', color: '#FFF176', weight: 50, enabled: true },
      { id: '4', label: 'High Quality Earphones', color: '#AED581', weight: 50, enabled: true },
      { id: '5', label: 'Sports Equipment', color: '#80CBC4', weight: 50, enabled: true },
      { id: '6', label: 'Gaming Console', color: '#81D4FA', weight: 50, enabled: true },
      { id: '7', label: 'Designer Cologne', color: '#90CAF9', weight: 50, enabled: true },
      { id: '8', label: 'Stylish Sunglasses', color: '#CE93D8', weight: 50, enabled: true },
      { id: '9', label: 'Comfy Sweatshirt', color: '#F48FB1', weight: 50, enabled: true },
      { id: '10', label: 'Favorite Band\'s Vinyl', color: '#FFAB91', weight: 50, enabled: true },
    ],
    favorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'preset-sport-options',
    name: 'Sport Options',
    emoji: '⚽',
    pinned: false,
    options: [
      { id: '1', label: 'Basketball', color: '#FF9E80', weight: 50, enabled: true },
      { id: '2', label: 'Soccer', color: '#FFCC80', weight: 50, enabled: true },
      { id: '3', label: 'Tennis', color: '#FFF176', weight: 50, enabled: true },
      { id: '4', label: 'Baseball', color: '#AED581', weight: 50, enabled: true },
      { id: '5', label: 'Golf', color: '#80CBC4', weight: 50, enabled: true },
      { id: '6', label: 'Swimming', color: '#81D4FA', weight: 50, enabled: true },
      { id: '7', label: 'Cycling', color: '#90CAF9', weight: 50, enabled: true },
      { id: '8', label: 'Boxing', color: '#CE93D8', weight: 50, enabled: true },
      { id: '9', label: 'Running', color: '#F48FB1', weight: 50, enabled: true },
      { id: '10', label: 'Gymnastics', color: '#FFAB91', weight: 50, enabled: true },
      { id: '11', label: 'Volleyball', color: '#FF3B30', weight: 50, enabled: true },
    ],
    favorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'preset-what-to-drink',
    name: 'What to Drink',
    emoji: '🥤',
    pinned: false,
    options: [
      { id: '1', label: 'Coffee', color: '#FF9E80', weight: 50, enabled: true },
      { id: '2', label: 'Tea', color: '#FFCC80', weight: 50, enabled: true },
      { id: '3', label: 'Water', color: '#FFF176', weight: 50, enabled: true },
      { id: '4', label: 'Juice', color: '#AED581', weight: 50, enabled: true },
      { id: '5', label: 'Soda', color: '#80CBC4', weight: 50, enabled: true },
      { id: '6', label: 'Milk', color: '#81D4FA', weight: 50, enabled: true },
      { id: '7', label: 'Wine', color: '#90CAF9', weight: 50, enabled: true },
      { id: '8', label: 'Beer', color: '#CE93D8', weight: 50, enabled: true },
      { id: '9', label: 'Cocktail', color: '#F48FB1', weight: 50, enabled: true },
      { id: '10', label: 'Smoothie', color: '#FFAB91', weight: 50, enabled: true },
      { id: '11', label: 'Hot Chocolate', color: '#FF3B30', weight: 50, enabled: true },
    ],
    favorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'preset-truth-or-dare-100',
    name: 'Truth or Dare',
    emoji: '🎭',
    pinned: false,
    options: [
      // Truth options (50)
      { id: 't1', label: "What's your biggest fear?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't2', label: "Who was your first crush?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't3', label: "Have you ever cheated?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't4', label: "What's your guilty pleasure?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't5', label: "Who do you stalk online?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't6', label: "Worst date you've had?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't7', label: "What's your weirdest dream?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't8', label: "Have you lied this week?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't9', label: "Who's your secret crush?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't10', label: "Worst kiss ever?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't11', label: "Have you ever ghosted?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't12', label: "Most embarrassing moment?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't13', label: "Who do you envy most?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't14', label: "What's your worst habit?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't15', label: "What's your hidden talent?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't16', label: "What's your worst fear?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't17', label: "Have you ever shoplifted?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't18', label: "First celebrity crush?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't19', label: "Who's your best kisser?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't20', label: "Have you ever faked sick?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't21', label: "What's your strangest food combo?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't22', label: "Ever been caught lying?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't23', label: "Who would you date here?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't24', label: "Worst grade in school?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't25', label: "What's your most used emoji?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't26', label: "Biggest turn off?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't27', label: "Biggest turn on?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't28', label: "Who was your first love?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't29', label: "What's your worst job?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't30', label: "What's your dream job?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't31', label: "Have you ever skipped class?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't32', label: "Worst haircut ever?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't33', label: "What's your favorite lie?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't34', label: "Who do you text the most?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't35', label: "Have you ever snooped?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't36', label: "Weirdest thing you collect?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't37', label: "Who do you trust least?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't38', label: "What's your guilty snack?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't39', label: "Have you ever been dumped?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't40', label: "Who broke your heart?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't41', label: "Funniest drunk story?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't42', label: "Most awkward DM received?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't43', label: "Weirdest search history item?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't44', label: "Have you ever faked homework?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't45', label: "Who was your first kiss?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't46', label: "Worst lie you told parents?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't47', label: "Have you ever cheated on a test?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't48', label: "Who annoys you the most?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't49', label: "What's your silliest fear?", color: '#81D4FA', weight: 50, enabled: true },
      { id: 't50', label: "Have you ever cried at work?", color: '#81D4FA', weight: 50, enabled: true },
      // Dare options (50)
      { id: 'd1', label: "Sing a song loudly", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd2', label: "Do 10 push-ups", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd3', label: "Dance without music", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd4', label: "Speak in an accent", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd5', label: "Post a silly selfie", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd6', label: "Text your crush \"hi\"", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd7', label: "Say the alphabet backward", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd8', label: "Do a catwalk strut", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd9', label: "Eat a spoon of ketchup", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd10', label: "Imitate someone here", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd11', label: "Whisper for 3 minutes", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd12', label: "Shout your crush's name", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd13', label: "Hold a plank for 1 min", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd14', label: "Show your last photo", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd15', label: "Tell a bad joke", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd16', label: "Do 20 jumping jacks", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd17', label: "Fake cry now", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd18', label: "Give a speech to the wall", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd19', label: "Pretend to be a waiter", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd20', label: "Dance like a robot", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd21', label: "Do a TikTok trend", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd22', label: "Show your DM inbox", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd23', label: "Do your best evil laugh", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd24', label: "Spin 10 times, then walk", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd25', label: "Balance a book on head", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd26', label: "Eat something spicy", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd27', label: "Do 5 squats", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd28', label: "Pretend you're a dog", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd29', label: "Yell the first word you think", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd30', label: "Pretend you're a celebrity", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd31', label: "Give someone a nickname", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd32', label: "Act like a goat", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd33', label: "Post a random emoji online", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd34', label: "Do 15 sit-ups", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd35', label: "Make a fish face", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd36', label: "Bark until your turn ends", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd37', label: "Pretend to propose", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd38', label: "Say \"I love pizza\" 10 times", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd39', label: "Draw something blindfolded", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd40', label: "Take a silly selfie with someone", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd41', label: "Spin in place until dizzy", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd42', label: "Pretend to be a teacher", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd43', label: "Make a weird face", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd44', label: "Act like a superhero", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd45', label: "Dance with no music 30 sec", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd46', label: "Pretend to be someone else here", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd47', label: "Do your best zombie walk", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd48', label: "Shout \"I'm the best\"", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd49', label: "Pretend to cry dramatically", color: '#FF3B30', weight: 50, enabled: true },
      { id: 'd50', label: "Walk like a model", color: '#FF3B30', weight: 50, enabled: true },
    ],
    favorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
export function AppProvider({ children }) {
  const [wheels, setWheels] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [rngConfig, setRngConfig] = useState(DEFAULT_RNG_CONFIG);
  const [coinStats, setCoinStats] = useState(DEFAULT_COIN_STATS);
  const [spinResults, setSpinResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWheelId, setCurrentWheelId] = useState('preset-what-to-eat');

  // Load data from storage on app start
  useEffect(() => {
    loadAppData();
  }, []);

  // Ensure preset wheels exist for new users
  const ensurePresetWheels = () => {
    const existingIds = new Set(wheels.map(w => w.id));
    const missingPresets = PRESET_WHEELS.filter(preset => !existingIds.has(preset.id));
    
    if (missingPresets.length > 0) {
      const newWheels = [...wheels, ...missingPresets];
      setWheels(newWheels);
      saveToStorage(STORAGE_KEYS.WHEELS, newWheels);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      ensurePresetWheels();
    }
  }, [isLoading, wheels]);

  const loadAppData = async () => {
    try {
      const [
        storedWheels,
        storedSettings,
        storedRngConfig,
        storedCoinStats,
        storedSpinResults,
        storedCurrentWheel,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.WHEELS),
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
        AsyncStorage.getItem(STORAGE_KEYS.RNG_CONFIG),
        AsyncStorage.getItem(STORAGE_KEYS.COIN_STATS),
        AsyncStorage.getItem(STORAGE_KEYS.SPIN_RESULTS),
        AsyncStorage.getItem('@minidecider_current_wheel'),
        AsyncStorage.getItem('@minidecider_current_wheel'),
      ]);

      if (storedWheels) setWheels(JSON.parse(storedWheels));
      if (storedSettings) setSettings(JSON.parse(storedSettings));
      if (storedRngConfig) setRngConfig(JSON.parse(storedRngConfig));
      if (storedCoinStats) setCoinStats(JSON.parse(storedCoinStats));
      if (storedSpinResults) setSpinResults(JSON.parse(storedSpinResults));
      if (storedCurrentWheel) setCurrentWheelId(JSON.parse(storedCurrentWheel));
    } catch (error) {
      console.error('Failed to load app data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToStorage = async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
    }
  };

  // Wheel management
  const addWheel = (wheel) => {
    const newWheels = [...wheels, wheel];
    setWheels(newWheels);
    saveToStorage(STORAGE_KEYS.WHEELS, newWheels);
  };

  const updateWheel = (updatedWheel) => {
    const newWheels = wheels.map(wheel => 
      wheel.id === updatedWheel.id ? updatedWheel : wheel
    );
    setWheels(newWheels);
    saveToStorage(STORAGE_KEYS.WHEELS, newWheels);
  };

  const deleteWheel = (wheelId) => {
    // If deleting current wheel, reset to default
    if (wheelId === currentWheelId) {
      setCurrentWheelId('preset-what-to-eat');
      saveToStorage('@minidecider_current_wheel', 'preset-what-to-eat');
    }
    
    const newWheels = wheels.filter(wheel => wheel.id !== wheelId);
    setWheels(newWheels);
    saveToStorage(STORAGE_KEYS.WHEELS, newWheels);
  };

  const searchWheels = (query) => {
    if (!query.trim()) return wheels;
    
    const lowercaseQuery = query.toLowerCase();
    return wheels.filter(wheel => 
      wheel.name.toLowerCase().includes(lowercaseQuery) ||
      wheel.options.some(option => 
        option.label.toLowerCase().includes(lowercaseQuery)
      )
    );
  };

  // Settings management
  const updateSettings = (newSettings) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    saveToStorage(STORAGE_KEYS.SETTINGS, updatedSettings);
  };

  // RNG Config management
  const updateRngConfig = (newConfig) => {
    const updatedConfig = { ...rngConfig, ...newConfig };
    setRngConfig(updatedConfig);
    saveToStorage(STORAGE_KEYS.RNG_CONFIG, updatedConfig);
  };

  // Coin Stats management
  const updateCoinStats = (newStats) => {
    setCoinStats(newStats);
    saveToStorage(STORAGE_KEYS.COIN_STATS, newStats);
  };

  // Spin Results management
  const addSpinResult = (result) => {
    const newResults = [result, ...spinResults].slice(0, 100); // Keep last 100 results
    setSpinResults(newResults);
    saveToStorage(STORAGE_KEYS.SPIN_RESULTS, newResults);
  };

  // Current wheel management
  const setCurrentWheel = (wheelId) => {
    setCurrentWheelId(wheelId);
    saveToStorage('@minidecider_current_wheel', wheelId);
  };

  const getCurrentWheel = () => {
    const wheel = wheels.find(w => w.id === currentWheelId);
    // Fallback to preset if current wheel not found
    return wheel || wheels.find(w => w.id === 'preset-what-to-eat') || wheels[0];
  };

  const getSpinResultsForWheel = (wheelId) => {
    return spinResults.filter(result => result.wheelId === wheelId);
  };

  // Data export/import (placeholder)
  const exportData = () => {
    return {
      wheels,
      settings,
      rngConfig,
      coinStats,
      spinResults,
      exportDate: new Date().toISOString(),
    };
  };

  const importData = (data) => {
    try {
      if (data.wheels) {
        setWheels(data.wheels);
        saveToStorage(STORAGE_KEYS.WHEELS, data.wheels);
      }
      if (data.settings) {
        setSettings(data.settings);
        saveToStorage(STORAGE_KEYS.SETTINGS, data.settings);
      }
      if (data.rngConfig) {
        setRngConfig(data.rngConfig);
        saveToStorage(STORAGE_KEYS.RNG_CONFIG, data.rngConfig);
      }
      if (data.coinStats) {
        setCoinStats(data.coinStats);
        saveToStorage(STORAGE_KEYS.COIN_STATS, data.coinStats);
      }
      if (data.spinResults) {
        setSpinResults(data.spinResults);
        saveToStorage(STORAGE_KEYS.SPIN_RESULTS, data.spinResults);
      }
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  };

  const resetApp = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.WHEELS),
        AsyncStorage.removeItem(STORAGE_KEYS.SETTINGS),
        AsyncStorage.removeItem(STORAGE_KEYS.RNG_CONFIG),
        AsyncStorage.removeItem(STORAGE_KEYS.COIN_STATS),
        AsyncStorage.removeItem(STORAGE_KEYS.SPIN_RESULTS),
      ]);
      
      setWheels([]);
      setSettings(DEFAULT_SETTINGS);
      setRngConfig(DEFAULT_RNG_CONFIG);
      setCoinStats(DEFAULT_COIN_STATS);
      setSpinResults([]);
      
      return true;
    } catch (error) {
      console.error('Failed to reset app:', error);
      return false;
    }
  };

  const value = {
    // State
    wheels,
    settings,
    rngConfig,
    coinStats,
    spinResults,
    isLoading,
    currentWheelId,
    
    // Wheel actions
    addWheel,
    updateWheel,
    deleteWheel,
    searchWheels,
    
    // Settings actions
    updateSettings,
    
    // RNG actions
    updateRngConfig,
    
    // Coin actions
    updateCoinStats,
    
    // Results actions
    addSpinResult,
    getSpinResultsForWheel,
    
    // Current wheel actions
    setCurrentWheel,
    getCurrentWheel,
    
    // Data actions
    exportData,
    importData,
    resetApp,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}