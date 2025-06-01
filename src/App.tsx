import React, { useState, useEffect } from 'react';
import styled, { keyframes, ThemeProvider, DefaultTheme } from 'styled-components';
import { initializeAudio, playSound, toggleMute, getMuteState } from './utils/sound';
// Import flag SVGs
import { ReactComponent as EnglishFlag } from './assets/flags/en.svg';
import { ReactComponent as TurkishFlag } from './assets/flags/tr.svg';

// Define the base theme interface
interface ThemeColors {
  primary: string;
  glow: string;
  hover: string;
  border: string;
  text: string;
  background: string;
}

// Define theme type
type ColorTheme = 'green' | 'amber' | 'blue' | 'white' | 'red';

// Extend DefaultTheme
declare module 'styled-components' {
  export interface DefaultTheme extends ThemeColors {}
}

// Add theme type
type Language = 'en' | 'tr';

interface ExpandIconProps {
  isExpanded: boolean;
}

interface SectionContentProps {
  isExpanded: boolean;
}

interface SettingsMenuProps {
  isOpen: boolean;
}

interface SettingsOptionProps {
  isActive?: boolean;
}

// Define theme colors
const themeColors: Record<ColorTheme, ThemeColors> = {
  green: {
    primary: '#00ff00',
    glow: 'rgba(0, 255, 0, 0.2)',
    hover: 'rgba(0, 255, 0, 0.1)',
    border: '#00ff00',
    text: '#00ff00',
    background: '#1a1a1a'
  },
  amber: {
    primary: '#ffb000',
    glow: 'rgba(255, 176, 0, 0.2)',
    hover: 'rgba(255, 176, 0, 0.1)',
    border: '#ffb000',
    text: '#ffb000',
    background: '#1a1a1a'
  },
  blue: {
    primary: '#00ffff',
    glow: 'rgba(0, 255, 255, 0.2)',
    hover: 'rgba(0, 255, 255, 0.1)',
    border: '#00ffff',
    text: '#00ffff',
    background: '#1a1a1a'
  },
  white: {
    primary: '#ffffff',
    glow: 'rgba(255, 255, 255, 0.2)',
    hover: 'rgba(255, 255, 255, 0.1)',
    border: '#ffffff',
    text: '#ffffff',
    background: '#1a1a1a'
  },
  red: {
    primary: '#E30A17', // Turkish flag red
    glow: 'rgba(227, 10, 23, 0.2)',
    hover: 'rgba(227, 10, 23, 0.1)',
    border: '#E30A17',
    text: '#E30A17',
    background: '#1a1a1a'
  }
};

const getThemeColors = (theme: DefaultTheme): ThemeColors => theme;

// CRT scanline animation
const scanline = keyframes`
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
`;

// Flicker animation
const flicker = keyframes`
  0% {
    opacity: 1;
  }
  2% {
    opacity: 0.98;
  }
  4% {
    opacity: 1;
  }
  6% {
    opacity: 0.99;
  }
  8% {
    opacity: 1;
  }
  10% {
    opacity: 0.97;
  }
  12% {
    opacity: 1;
  }
  14% {
    opacity: 0.98;
  }
  16% {
    opacity: 1;
  }
  18% {
    opacity: 0.99;
  }
  20% {
    opacity: 1;
  }
  22% {
    opacity: 0.98;
  }
  24% {
    opacity: 1;
  }
  26% {
    opacity: 0.97;
  }
  28% {
    opacity: 1;
  }
  30% {
    opacity: 0.98;
  }
  32% {
    opacity: 1;
  }
  34% {
    opacity: 0.99;
  }
  36% {
    opacity: 1;
  }
  38% {
    opacity: 0.98;
  }
  40% {
    opacity: 1;
  }
  42% {
    opacity: 0.97;
  }
  44% {
    opacity: 1;
  }
  46% {
    opacity: 0.98;
  }
  48% {
    opacity: 1;
  }
  50% {
    opacity: 0.99;
  }
  52% {
    opacity: 1;
  }
  54% {
    opacity: 0.98;
  }
  56% {
    opacity: 1;
  }
  58% {
    opacity: 0.97;
  }
  60% {
    opacity: 1;
  }
  62% {
    opacity: 0.98;
  }
  64% {
    opacity: 1;
  }
  66% {
    opacity: 0.99;
  }
  68% {
    opacity: 1;
  }
  70% {
    opacity: 0.98;
  }
  72% {
    opacity: 1;
  }
  74% {
    opacity: 0.97;
  }
  76% {
    opacity: 1;
  }
  78% {
    opacity: 0.98;
  }
  80% {
    opacity: 1;
  }
  82% {
    opacity: 0.99;
  }
  84% {
    opacity: 1;
  }
  86% {
    opacity: 0.98;
  }
  88% {
    opacity: 1;
  }
  90% {
    opacity: 0.97;
  }
  92% {
    opacity: 1;
  }
  94% {
    opacity: 0.98;
  }
  96% {
    opacity: 1;
  }
  98% {
    opacity: 0.99;
  }
  100% {
    opacity: 1;
  }
`;

const AppContainer = styled.div`
  background-color: #1a1a1a;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  position: relative;
  padding-bottom: 120px;

  @media (max-width: 768px) {
    padding: 10px;
    padding-bottom: 100px;
  }
`;

const PageHeader = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.text};
  font-family: 'VT323', monospace;
  font-size: 1.2em;
  margin-bottom: 20px;
  opacity: 0.8;
`;

const PipBoyContainer = styled.div`
  background-color: ${({ theme }) => theme.background};
  border: 2px solid #4a4a4a;
  border-radius: 10px;
  padding: 20px;
  max-width: 800px;
  width: 100%;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 20px ${({ theme }) => theme.glow};
  margin-bottom: 30px;
  animation: ${flicker} 3s infinite;

  @media (max-width: 768px) {
    padding: 15px;
    margin-bottom: 20px;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      ${({ theme }) => theme.glow} 50%,
      rgba(0, 0, 0, 0.1) 50%
    );
    background-size: 100% 4px;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: linear-gradient(
      to bottom,
      transparent 50%,
      ${({ theme }) => theme.glow} 50%
    );
    background-size: 100% 4px;
    animation: ${scanline} 8s linear infinite;
    pointer-events: none;
  }
`;

const PipBoyScreen = styled.div`
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  font-family: 'VT323', monospace;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 5px;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 2px solid ${({ theme }) => theme.border};
  padding-bottom: 10px;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
    text-align: center;
    gap: 15px;
    margin-bottom: 20px;
  }
`;

const HeaderText = styled.div`
  text-align: left;

  @media (max-width: 768px) {
    text-align: center;
  }
`;

const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  border: 2px solid ${({ theme }) => theme.border};
  border-radius: 5px;
  padding: 3px;
  background-color: ${({ theme }) => theme.glow};
  box-shadow: 0 0 10px ${({ theme }) => theme.glow};

  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
    margin-bottom: 10px;
  }
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.text};
  font-size: 2.8rem;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const Subtitle = styled.h2`
  color: ${({ theme }) => theme.text};
  font-size: 1.6rem;
  margin: 10px 0;
  opacity: 0.8;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }

  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

const Section = styled.section`
  margin: 20px 0;
  padding: 15px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 5px;
`;

const SectionTitle = styled.h3`
  color: ${({ theme }) => theme.text};
  font-size: 1.4rem;
  margin: 0 0 10px 0;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover {
    opacity: 0.8;
  }
`;

const ExpandIcon = styled.span<{ isExpanded: boolean }>`
  display: inline-block;
  transition: transform 0.3s ease;
  transform: ${({ isExpanded }) => `rotate(${isExpanded ? '90deg' : '0deg'})`};
  margin-left: 10px;
  color: ${({ theme }) => theme.text};
`;

const SectionContent = styled.div<{ isExpanded: boolean }>`
  max-height: ${({ isExpanded }) => isExpanded ? '1000px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
  opacity: ${({ isExpanded }) => isExpanded ? '1' : '0'};
  border-top: ${({ isExpanded, theme }) => isExpanded ? `1px solid ${theme.border}` : 'none'};
  margin-top: ${({ isExpanded }) => isExpanded ? '10px' : '0'};
  padding-top: ${({ isExpanded }) => isExpanded ? '10px' : '0'};
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li<{ theme: DefaultTheme }>`
  margin: 10px 0;
  padding-left: 20px;
  position: relative;
  font-size: 1.1rem;
  line-height: 1.4;

  &::before {
    content: '•';
    position: absolute;
    left: 0;
    color: ${({ theme }) => getThemeColors(theme).text};
  }
`;

const ContactListItem = styled.li`
  margin: 10px 0;
  position: relative;
  list-style: none;
`;

const ContactLink = styled.a<{ theme: ColorTheme }>`
  color: ${({ theme }) => getThemeColors(theme).text};
  text-decoration: none;
  transition: opacity 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &:hover {
    opacity: 0.8;
    text-decoration: underline;
  }
`;

const ContactIcon = styled.span`
  font-size: 1.2em;
`;

const ContactButton = styled.button<{ isCollapsed?: boolean; theme: ColorTheme; isActive?: boolean }>`
  width: ${props => props.isCollapsed ? '65px' : '65px'};
  height: ${props => props.isCollapsed ? '55px' : '65px'};
  background-color: ${props => props.isActive ? getThemeColors(props.theme).primary : getThemeColors(props.theme).background};
  border: 2px solid ${({ theme }) => getThemeColors(theme).border};
  color: ${props => props.isActive ? getThemeColors(props.theme).background : getThemeColors(props.theme).text};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'VT323', monospace;
  margin: 3px;
  font-size: ${props => props.isCollapsed ? '0.9em' : '1em'};
  padding: ${props => props.isCollapsed ? '0 5px' : '0'};
  white-space: nowrap;

  @media (max-width: 480px) {
    width: ${props => props.isCollapsed ? '70px' : '70px'};
    height: ${props => props.isCollapsed ? '60px' : '70px'};
    font-size: ${props => props.isCollapsed ? '0.9em' : '1em'};
    margin: 4px;
  }

  &:hover {
    background-color: ${({ theme }) => getThemeColors(theme).hover};
    color: ${({ theme }) => getThemeColors(theme).text};
  }

  &.active {
    background-color: ${({ theme }) => getThemeColors(theme).primary};
    color: ${({ theme }) => getThemeColors(theme).background};
  }
`;

const ContactButtonsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
  align-items: center;
`;

const ContactInfoArea = styled.div`
  border: 2px solid ${({ theme }) => theme.border};
  padding: 20px;
  min-height: 100px;
  margin-top: 20px;
  font-family: 'VT323', monospace;
  color: ${({ theme }) => theme.text};
  position: relative;
  display: flex;
  align-items: center;
`;

const ContactInfoText = styled.p`
  margin: 0;
  font-size: 1.2em;
  display: flex;
  align-items: center;
  gap: 10px;

  &::before {
    content: '>';
    color: ${({ theme }) => theme.text};
  }
`;

const DownloadCVButton = styled.a<{ theme: ColorTheme }>`
  display: block;
  width: 200px;
  margin: 30px auto;
  padding: 12px 20px;
  background-color: ${({ theme }) => getThemeColors(theme).background};
  border: 2px solid ${({ theme }) => getThemeColors(theme).border};
  color: ${({ theme }) => getThemeColors(theme).text};
  text-align: center;
  text-decoration: none;
  font-family: 'VT323', monospace;
  font-size: 1.2em;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => getThemeColors(theme).primary};
    color: ${({ theme }) => getThemeColors(theme).background};
  }
`;

const CopyrightText = styled.div<{ theme: ColorTheme }>`
  text-align: center;
  color: ${({ theme }) => getThemeColors(theme).text};
  font-family: 'VT323', monospace;
  font-size: 1.2em;
  opacity: 0.8;
  margin-bottom: 60px;
  position: relative;
  z-index: 1;
`;

const CreditsText = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.text};
  font-family: 'VT323', monospace;
  font-size: 1em;
  opacity: 0.6;
  margin-top: 10px;
  line-height: 1.4;
`;

const Footer = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.text};
  font-family: 'VT323', monospace;
  font-size: 1.2em;
  margin-top: 20px;
  opacity: 0.8;
`;

const ExperienceItem = styled.div`
  margin-bottom: 20px;
  border: 1px solid ${({ theme }) => theme.border};
  padding: 15px;
  border-radius: 5px;
`;

const ExperienceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

const ExperienceDetails = styled.div`
  margin-top: 5px;
  font-size: 1.1rem;
`;

const ExperienceTitle = styled.div`
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 5px;
`;

const ColorSquare = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  background-color: ${props => props.color};
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 5px rgba(0, 255, 0, 0.2);
  transition: all 0.3s ease;
`;

const FlagIcon = styled.div<{ isActive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 18px;
  border-radius: 2px;
  overflow: hidden;
  filter: brightness(0.9) contrast(1.1);
  
  svg {
    width: 100%;
    height: 100%;
  }

  ${props => props.isActive && `
    filter: brightness(1) contrast(1.2);
    box-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
  `}
`;

const themeIcons = {
  green: <ColorSquare color="#00ff00" />,
  amber: <ColorSquare color="#ffb000" />,
  blue: <ColorSquare color="#00ffff" />,
  white: <ColorSquare color="#ffffff" />,
  red: <ColorSquare color="#E30A17" />
};

interface LanguageInfo {
  name: string;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  label: string;
}

const languageNames: Record<Language, LanguageInfo> = {
  en: {
    name: 'English',
    icon: EnglishFlag,
    label: 'ENGLISH'
  },
  tr: {
    name: 'Turkish',
    icon: TurkishFlag,
    label: 'TÜRKÇE'
  }
};

const StickyFooter = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 1000px;
  max-width: calc(100% - 40px);
  background-color: ${({ theme }) => theme.background};
  border: 2px solid ${({ theme }) => theme.border};
  border-bottom: none;
  border-radius: 10px 10px 0 0;
  padding: 15px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'VT323', monospace;
  color: ${({ theme }) => theme.text};
  z-index: 1000;
  box-shadow: 0 0 20px ${({ theme }) => theme.glow};

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
    border-radius: 0;
    padding: 10px;
    flex-direction: column;
    gap: 10px;
  }

  @media (max-width: 480px) {
    padding: 8px;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      ${({ theme }) => theme.glow} 50%,
      rgba(0, 0, 0, 0.1) 50%
    );
    background-size: 100% 4px;
    pointer-events: none;
    border-radius: 10px 10px 0 0;

    @media (max-width: 768px) {
      border-radius: 0;
    }
  }
`;

const FooterSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    gap: 10px;
  }
`;

const CenterSection = styled(FooterSection)`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);

  @media (max-width: 768px) {
    position: static;
    transform: none;
    order: -1;
  }
`;

const FooterText = styled.div`
  font-size: 1.2em;
  opacity: 0.8;
  white-space: nowrap;

  @media (max-width: 768px) {
    display: none;
  }
`;

const ControlButton = styled.button<{ isActive?: boolean; theme: ColorTheme }>`
  background: transparent;
  border: 2px solid ${({ theme }) => getThemeColors(theme).border};
  color: ${({ theme }) => props => props.isActive ? getThemeColors(theme).background : getThemeColors(theme).text};
  background-color: ${({ theme }) => props => props.isActive ? getThemeColors(theme).primary : 'transparent'};
  padding: 8px 15px;
  font-family: 'VT323', monospace;
  font-size: 1.2em;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 1.1em;
    padding: 8px 12px;
    min-width: 120px;
    justify-content: center;
  }

  @media (max-width: 480px) {
    font-size: 1em;
    padding: 6px 10px;
    min-width: 100px;
  }

  &:hover {
    background-color: ${({ theme }) => getThemeColors(theme).hover};
  }
`;

const MobileMenuButton = styled(ControlButton)`
  display: none;
  width: 100%;
  justify-content: center;
  margin-bottom: 5px;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileMenuContent = styled.div<{ isOpen: boolean }>`
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
    max-height: ${({ isOpen }) => isOpen ? '500px' : '0'};
    overflow: hidden;
    transition: max-height 0.3s ease-in-out;
    opacity: ${({ isOpen }) => isOpen ? '1' : '0'};
    margin-top: ${({ isOpen }) => isOpen ? '5px' : '0'};
    gap: 5px;
  }
`;

const ThemeButton = styled(ControlButton)<{ themeColor: keyof typeof themeColors }>`
  border-color: ${({ theme }) => getThemeColors(theme).primary};
  color: ${({ theme }) => getThemeColors(theme).primary};

  &:hover {
    background-color: ${({ theme }) => getThemeColors(theme).hover};
  }

  ${props => props.isActive && `
    background-color: ${getThemeColors(props.theme).primary};
    color: #1a1a1a;
  `}
`;

const ThemeMenuContainer = styled.div`
  position: relative;
`;

const ThemeToggle = styled(ControlButton)`
  min-width: 140px;
  justify-content: space-between;
  
  &::after {
    content: '▼';
    font-size: 0.8em;
    transition: transform 0.3s ease;
    ${props => props.isActive && `
      transform: rotate(180deg);
    `}
  }
`;

const ThemeMenu = styled.div<SettingsMenuProps>`
  position: absolute;
  bottom: calc(100% + 10px);
  left: 0;
  background-color: #1a1a1a;
  border: 2px solid #4a4a4a;
  border-radius: 5px;
  overflow: hidden;
  transition: all 0.3s ease;
  opacity: ${({ isOpen }) => isOpen ? 1 : 0};
  transform: translateY(${({ isOpen }) => isOpen ? '0' : '10px'});
  pointer-events: ${({ isOpen }) => isOpen ? 'all' : 'none'};
  z-index: 1001;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 255, 0, 0.1) 50%,
      rgba(0, 0, 0, 0.1) 50%
    );
    background-size: 100% 4px;
    pointer-events: none;
  }
`;

const ThemeOption = styled.button<{ themeColor: keyof typeof themeColors }>`
  width: 100%;
  padding: 10px 15px;
  background: transparent;
  border: none;
  border-bottom: 1px solid #4a4a4a;
  color: ${({ theme }) => getThemeColors(theme).primary};
  font-family: 'VT323', monospace;
  font-size: 1.2em;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${({ theme }) => getThemeColors(theme).hover};
  }
`;

interface ContactInfo {
  icon: string;
  label: string;
  info: string;
  link?: string;
}

interface SectionData {
  title: string;
  items: Array<string | React.ReactElement>;
}

const MenuContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: stretch;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const SettingsMenuContainer = styled.div`
  position: relative;
  display: flex;
`;

const SettingsToggle = styled(ControlButton)<{ isActive: boolean }>`
  min-width: 140px;
  justify-content: space-between;
  height: 100%;
  padding: 8px 15px;
  display: flex;
  align-items: center;
  white-space: nowrap;
  
  &::after {
    content: '▼';
    font-size: 0.8em;
    transition: transform 0.3s ease;
    transform: rotate(${props => props.isActive ? '180deg' : '0deg'});
    color: ${({ theme }) => getThemeColors(theme).text};
  }
`;

const SettingsMenu = styled.div<SettingsMenuProps>`
  position: absolute;
  bottom: calc(100% + 10px);
  left: 0;
  background-color: ${({ theme }) => getThemeColors(theme).background};
  border: 2px solid ${({ theme }) => getThemeColors(theme).border};
  border-radius: 5px;
  overflow: hidden;
  transition: all 0.3s ease;
  opacity: ${({ isOpen }) => isOpen ? '1' : '0'};
  transform: translateY(${({ isOpen }) => isOpen ? '0' : '10px'});
  pointer-events: ${({ isOpen }) => isOpen ? 'all' : 'none'};
  z-index: 1001;
  min-width: 140px;
  width: 100%;

  @media (max-width: 768px) {
    position: fixed;
    bottom: auto;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) translateY(${({ isOpen }) => isOpen ? '0' : '10px'});
    width: 90%;
    max-width: 300px;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      ${({ theme }) => getThemeColors(theme).glow} 50%,
      rgba(0, 0, 0, 0.1) 50%
    );
    background-size: 100% 4px;
    pointer-events: none;
  }
`;

const SettingsOption = styled.button<SettingsOptionProps>`
  width: 100%;
  padding: 8px 15px;
  background: transparent;
  border: none;
  border-bottom: 1px solid ${({ theme }) => getThemeColors(theme).border};
  color: ${({ theme, isActive }) => 
    isActive ? getThemeColors(theme).background : getThemeColors(theme).text};
  background-color: ${({ theme, isActive }) => 
    isActive ? getThemeColors(theme).primary : 'transparent'};
  font-family: 'VT323', monospace;
  font-size: 1.2em;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  height: 40px;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${({ theme, isActive }) => 
      isActive ? getThemeColors(theme).primary : getThemeColors(theme).hover};
  }

  ${FlagIcon} {
    flex-shrink: 0;
  }
`;

// Add translations object
const translations: Record<Language, {
  pageHeader: string;
  subtitle: string;
  downloadCV: string;
  copyright: string;
  credits: string[];
  systemControls: string;
  audioOn: string;
  audioOff: string;
  selectContact: string;
  colorThemes: {
    green: string;
    amber: string;
    blue: string;
    white: string;
    red: string;
  };
  sections: {
    [key: string]: {
      title: string;
      items: string[];
    };
  };
  contactInfo: {
    [key: string]: {
      label: string;
      info: string;
    };
  };
  experience: {
    tdkt: {
      title: string;
      role: string;
      location: string;
      items: string[];
    };
    turker: {
      title: string;
      role: string;
      location: string;
      items: string[];
    };
  };
  education: {
    master: {
      title: string;
      degree: string;
      location: string;
    };
    bachelor: {
      title: string;
      degree: string;
      location: string;
      gpa: string;
    };
  };
  projects: {
    jobPlatform: {
      title: string;
      description: string;
      details: string;
      technologies: string;
      techList: string;
    };
    bookPlatform: {
      title: string;
      description: string;
      details: string;
      technologies: string;
      techList: string;
    };
    taskTracker: {
      title: string;
      description: string;
      details: string;
      technologies: string;
      techList: string;
    };
    portfolio: {
      title: string;
      description: string;
      details: string;
      technologies: string;
      techList: string;
    };
  };
  certificates: {
    webDevBootcamp: {
      title: string;
      issuer: string;
    };
    nodeBootcamp: {
      title: string;
      issuer: string;
    };
    frontendDev: {
      title: string;
      issuer: string;
    };
  };
}> = {
  en: {
    pageHeader: '[Click to expand the tabs]',
    subtitle: 'Back-End Developer',
    downloadCV: 'Download CV',
    copyright: '[2025 • Mustafa Golec]',
    credits: [
      '[Credits]',
      '[Site theme is inspired by Pip-Boy UI from Fallout game]',
      '[Sound effects taken from Crysis game]'
    ],
    systemControls: '[SYSTEM CONTROLS]',
    audioOn: '🔊 AUDIO ON',
    audioOff: '🔈 AUDIO OFF',
    selectContact: 'Select a contact option above',
    colorThemes: {
      green: 'GREEN',
      amber: 'AMBER',
      blue: 'BLUE',
      white: 'WHITE',
      red: 'RED'
    },
    sections: {
      contact: {
        title: 'CONTACT',
        items: []
      },
      status: {
        title: 'BIO',
        items: [
          'Hey! I\'m [Mustafa Göleç] — Back-End Developer.\nI\'m a passionate developer focused on building back-end systems using Node.js and related technologies. For me, it\'s not just about writing code — it\'s about creating clean, understandable, and practical solutions to real-world problems.',
          'What I Do:\nBuild RESTful APIs with Node.js and Express.js\nUse MongoDB to store and manage data efficiently\nImplement authentication with JWT and Bcrypt\nTest and document APIs with Postman and Swagger\nKeep everything version-controlled with Git & GitHub',
          'What I\'m Aiming For:\nSolve real problems through clean and modular code\nLearn constantly and grow with every project\nWork in collaborative environments where I can contribute and improve'
        ]
      },
      skills: {
        title: 'SKILLS',
        items: [
          'Backend Development:\nNode.js, Express.js, MongoDB, RESTful APIs',
          'Frontend Development:\nReact, JavaScript, HTML, CSS',
          'Tools & Technologies:\nGit, GitHub, Postman, Swagger, Docker',
          'Soft Skills:\nProblem Solving, Team Collaboration, Communication'
        ]
      },
      experience: {
        title: 'EXPERIENCE',
        items: []
      },
      education: {
        title: 'EDUCATION',
        items: []
      },
      projects: {
        title: 'PROJECTS',
        items: []
      },
      certificates: {
        title: 'CERTIFICATES',
        items: []
      }
    },
    contactInfo: {
      email: {
        label: 'Email',
        info: 'mustafagolec1616@gmail.com'
      },
      location: {
        label: 'Location',
        info: 'Bursa, Türkiye'
      },
      linkedin: {
        label: 'LinkedIn',
        info: 'Click here to access my LinkedIn profile'
      },
      github: {
        label: 'GitHub',
        info: 'Click here to access my GitHub profile'
      },
      scholar: {
        label: 'Scholar',
        info: 'Click here to access my Google Scholar profile'
      },
      youtube: {
        label: 'YouTube',
        info: 'Click here to access my YouTube channel'
      }
    },
    experience: {
      tdkt: {
        title: 'Taşıt Dinamiği Kontrol Teknolojileri AŞ',
        role: 'Simulation and Software Engineer',
        location: 'Bursa, Türkiye',
        items: [
          'Developing backend services for company websites and applications using Node.js',
          'Creating interactive 3D animations for the company website using Three.js',
          'Performing real-time vehicle driving and dynamic tests using Simulink-based CarMaker/TruckMaker software under various scenarios',
          'Designing 3D vehicle and environment models for simulations using Blender',
          'Designing testing environments for simulation purposes',
          'Developing new maneuvers or transferring real-world test scenarios into virtual environments for simulation purposes',
          'Preparing data reports, instructions, and user manuals related to simulation scenarios',
          'Creating 3D animations of company projects for presentation at technology fairs',
          'Implementing autonomous driving scenarios on the AWSIM project using ROS2 and Unity on Ubuntu'
        ]
      },
      turker: {
        title: 'Türker Yazılım Information Systems and Technologies Industry and Trade Ltd. Co.',
        role: 'Front-End Developer Intern',
        location: 'Bursa, TR',
        items: [
          'Designing an alternative website for the company\'s product "MÖBLESİS"',
          'Designing HTML email templates for advertising purposes'
        ]
      }
    },
    education: {
      master: {
        title: 'Bursa Technical University',
        degree: 'Computer Engineering - Master\'s Degree',
        location: 'Bursa, TR'
      },
      bachelor: {
        title: 'Kutahya Dumlupinar University',
        degree: 'Computer Engineering - Bachelor\'s Degree',
        location: 'Kutahya, TR',
        gpa: 'GPA: 3.25'
      }
    },
    projects: {
      jobPlatform: {
        title: 'Mini Job Listing Platform',
        description: 'Job listing platform with user authentication and role-based access control',
        details: 'This project is a lightweight job listing platform where users can register, log in, and apply for jobs. Employers can create companies and post job openings that users can browse and filter by location or category. The system includes role-based access control to differentiate between regular users and employers.',
        technologies: 'Technologies:',
        techList: 'Node.js, Express.js, MongoDB, JWT for authentication, Bcrypt for password hashing, HTML, Tailwind CSS, Vanilla JavaScript'
      },
      bookPlatform: {
        title: 'Book Sharing and Review Platform',
        description: 'Book sharing application with review and rating system',
        details: 'A simple book sharing and review application that allows administrators to add, update, or delete books. Users can submit one review per book, including ratings and comments. The system calculates and displays the average rating for each book along with the number of reviews.',
        technologies: 'Technologies:',
        techList: 'Node.js, Express.js, MongoDB, Role-based access control, HTML, Tailwind CSS, Vanilla JavaScript'
      },
      taskTracker: {
        title: 'Task Tracker Application',
        description: 'Task management system with status tracking and filtering',
        details: 'This application allows users to create and manage their task lists with features such as adding tasks with titles, descriptions, and statuses (to-do, in-progress, done). Users can filter tasks based on their status, and the system can optionally track the history of task status changes.',
        technologies: 'Technologies:',
        techList: 'Node.js, Express.js, MongoDB, RESTful API design, HTML, Tailwind CSS, Vanilla JavaScript'
      },
      portfolio: {
        title: 'Fallout Pip-Boy Inspired Portfolio',
        description: 'Interactive portfolio website with retro-futuristic UI design',
        details: 'A retro-futuristic personal portfolio website inspired by the iconic Pip-Boy interface from the Fallout game series. The project features an interactive terminal-style UI with CRT screen effects, expandable sections, and a responsive design that maintains the authentic Pip-Boy aesthetic while ensuring modern functionality. The interface includes animated scanlines, screen flicker effects, and a monochromatic green color scheme that recreates the classic terminal look.',
        technologies: 'Technologies:',
        techList: 'React, TypeScript, Styled Components, CSS Animations, HTML5, Responsive Design'
      }
    },
    certificates: {
      webDevBootcamp: {
        title: 'The Web Developer Bootcamp 2025',
        issuer: 'Udemy'
      },
      nodeBootcamp: {
        title: 'Node.js, Express, MongoDB & More: The Complete Bootcamp',
        issuer: 'Udemy'
      },
      frontendDev: {
        title: 'Beginner\'s Frontend Web Development',
        issuer: 'Patika.dev'
      }
    }
  },
  tr: {
    pageHeader: '[Sekmeleri genişletmek için tıklayın]',
    subtitle: 'Back-End Developer',
    downloadCV: 'CV İndir',
    copyright: '[2025 • Mustafa Göleç]',
    credits: [
      '[Credits]',
      '[Site teması Fallout oyunundaki Pip-Boy arayüzünden ilham alınmıştır]',
      '[Ses efektleri Crysis oyunundan alınmıştır]'
    ],
    systemControls: '[SİSTEM KONTROLLERİ]',
    audioOn: '🔊 SES AÇIK',
    audioOff: '🔈 SES KAPALI',
    selectContact: 'Yukarıdan bir iletişim yöntemi seçin',
    colorThemes: {
      green: 'YEŞİL',
      amber: 'KEHRİBAR',
      blue: 'MAVİ',
      white: 'BEYAZ',
      red: 'KIRMIZI'
    },
    sections: {
      contact: {
        title: 'İLETİŞİM',
        items: []
      },
      status: {
        title: 'HAKKIMDA',
        items: [
          'Merhaba! Ben Mustafa Göleç — Back-End Developer.\nNode.js ve ilgili teknolojileri kullanarak back-end sistemleri geliştirmeye odaklanmış tutkulu bir geliştiriciyim. Benim için sadece kod yazmak değil — gerçek dünya problemlerine temiz, anlaşılır ve pratik çözümler üretmek önemli.',
          'Uzmanlık Alanlarım:\nNode.js ve Express.js ile performans odaklı RESTful API\'ler geliştiriyorum\nMongoDB ve Mongoose kullanarak esnek ve verimli veri modellemeleri oluşturuyorum.\nJWT (JSON Web Token) ve Bcrypt ile güvenli kimlik doğrulama ve yetkilendirme sistemleri kuruyorum.\nPostman ve Swagger kullanarak API\'leri test ediyor ve dökümantasyon süreçlerini yönetiyorum.\nGit ve GitHub ile versiyon kontrolü ve takım içi iş birliğini sürdürülebilir kılıyorum.',
          'Hedeflerim:\nTemiz, okunabilir ve modüler kod yapıları ile yazılım çözümleri üretmek.\nHer projede yeni teknolojiler öğrenerek teknik yetkinliğimi artırmak.\nTakım çalışmasına yatkın, gelişime açık ve katma değer sağlayabileceğim profesyonel ortamlarda çalışmak.'
        ]
      },
      skills: {
        title: 'YETENEKLER',
        items: [
          'Back-End Geliştirme:\nNode.js, Express.js, MongoDB, RESTful API\'ler',
          'Front-End Geliştirme:\nReact, JavaScript, HTML, CSS',
          'Araçlar & Teknolojiler:\nGit, GitHub, Postman, Swagger, Docker',
          'Yumuşak Beceriler (Soft Skills):\nProblem Çözme, Takım Çalışması, İletişim'
        ]
      },
      experience: {
        title: 'DENEYİM',
        items: []
      },
      education: {
        title: 'EĞİTİM',
        items: []
      },
      projects: {
        title: 'PROJELER',
        items: []
      },
      certificates: {
        title: 'SERTİFİKALAR',
        items: []
      }
    },
    contactInfo: {
      email: {
        label: 'E-posta',
        info: 'mustafagolec1616@gmail.com'
      },
      location: {
        label: 'Konum',
        info: 'Bursa, Türkiye'
      },
      linkedin: {
        label: 'LinkedIn',
        info: 'LinkedIn profilime erişmek için tıklayın'
      },
      github: {
        label: 'GitHub',
        info: 'GitHub profilime erişmek için tıklayın'
      },
      scholar: {
        label: 'Scholar',
        info: 'Google Scholar profilime erişmek için tıklayın'
      },
      youtube: {
        label: 'YouTube',
        info: 'YouTube kanalıma erişmek için tıklayın'
      }
    },
    experience: {
      tdkt: {
        title: 'Taşıt Dinamiği Kontrol Teknolojileri AŞ',
        role: 'Simülasyon ve Yazılım Mühendisi',
        location: 'Bursa, Türkiye',
        items: [
          'Node.JS ile şirket web site ve uygulamaları için arka plan (Back-End) geliştirme',
          'ThreeJS ile şirket web sitesi için 3 boyutlu interaktif animasyonlar hazırlanması',
          'Simulink tabanlı CarMaker/TruckMaker yazılımı ile çeşitli senaryolarla gerçek zamanlı araç sürüş ve dinamik testlerin gerçekleştirilmesi',
          'Blender ile simülasyonlar için 3D araç ve çevre modellerinin tasarlanması',
          'Simülasyonlar için test ortamı tasarlama',
          'Simülasyonlar için yeni manevralar tasarlanması veya gerçek test senaryoların sanal ortama aktarılması',
          'Simülasyon senaryolarına yönelik veri raporları, talimat ve kullanım kılavuzlarının hazırlanması',
          'Teknoloji fuarlarında gösterilmek üzere, şirket projelerinin 3D animasyonlarının hazırlanması',
          'Ubuntu üzerinde ROS2 ve Unity kullanarak, AWSIM projesi üzerinde otonom sürüş senaryolarının gerçekleştirilmesi'
        ]
      },
      turker: {
        title: 'Türker Yazılım Bilgi Sistemleri ve Teknolojileri San. Tic. Ltd. Şti.',
        role: 'Front-End Developer Stajyeri',
        location: 'Bursa, TR',
        items: [
          'Firmanın ürünü olan "MÖBLESİS" için alternatif website tasarlanması',
          'Reklam amaçlı HTML Email örnekleri tasarlanması'
        ]
      }
    },
    education: {
      master: {
        title: 'Bursa Teknik Üniversitesi',
        degree: 'Bilgisayar Mühendisliği - Yüksek Lisans',
        location: 'Bursa, TR'
      },
      bachelor: {
        title: 'Kütahya Dumlupınar Üniversitesi',
        degree: 'Bilgisayar Mühendisliği - Lisans',
        location: 'Kütahya, TR',
        gpa: 'GANO: 3.25'
      }
    },
    projects: {
      jobPlatform: {
        title: 'Mini İş İlanı Platformu',
        description: 'Kullanıcı kimlik doğrulama ve rol tabanlı erişim kontrolü ile iş ilanı platformu',
        details: 'Bu proje, kullanıcıların kayıt olup giriş yapabildiği ve iş başvurusu yapabildiği hafif bir iş ilanı platformudur. İşverenler şirket oluşturabilir ve iş ilanı yayınlayabilir. Kullanıcılar bu ilanları konum veya kategoriye göre filtreleyerek görüntüleyebilir. Sistem, normal kullanıcılar ile işverenleri ayırt etmek için rol tabanlı erişim kontrolü içerir.',
        technologies: 'Kullanılan Teknolojiler:',
        techList: 'Node.js, Express.js, MongoDB, Kimlik doğrulama için JWT, Şifreleme için Bcrypt, HTML, Tailwind CSS, Vanilla JavaScript'
      },
      bookPlatform: {
        title: 'Kitap Paylaşım ve İnceleme Platformu',
        description: 'İnceleme ve puanlama sistemi ile kitap paylaşım uygulaması',
        details: 'Yöneticilerin kitap ekleyebildiği, güncelleyebildiği veya silebildiği basit bir kitap paylaşım ve inceleme uygulamasıdır. Kullanıcılar her kitap için bir inceleme gönderebilir; bu incelemeler puanlama ve yorum içerebilir. Sistem, her kitap için ortalama puanı ve toplam inceleme sayısını hesaplayarak gösterir.',
        technologies: 'Kullanılan Teknolojiler:',
        techList: 'Node.js, Express.js, MongoDB, Rol tabanlı erişim kontrolü, HTML, Tailwind CSS, Vanilla JavaScript'
      },
      taskTracker: {
        title: 'Görev Takip Uygulaması',
        description: 'Durum takibi ve filtreleme özellikli görev yönetim sistemi',
        details: 'Bu uygulama, kullanıcıların başlık, açıklama ve durum (yapılacak, devam ediyor, tamamlandı) bilgileriyle görevler oluşturmasına ve yönetmesine olanak tanır. Kullanıcılar görevleri durumlarına göre filtreleyebilir ve sistem, isteğe bağlı olarak görev durum değişikliklerinin geçmişini takip edebilir.',
        technologies: 'Kullanılan Teknolojiler:',
        techList: 'Node.js, Express.js, MongoDB, RESTful API tasarımı, HTML, Tailwind CSS, Vanilla JavaScript'
      },
      portfolio: {
        title: 'Fallout Pip-Boy Esinli Portfolyo',
        description: 'Fallout oyunu Pip-Boy arayüzünden esinlenen retro-futuristik bir kişisel portfolyo websitesi',
        details: 'Fallout oyun serisindeki ikonik Pip-Boy arayüzünden esinlenen retro-fütüristik bir kişisel portfolyo websitesidir. Proje, CRT ekran efektleriyle birlikte terminal tarzı etkileşimli bir kullanıcı arayüzü sunar. Genişletilebilir bölümler ve duyarlı tasarım ile otantik Pip-Boy estetiğini korurken modern işlevselliği sağlar. Arayüzde animasyonlu tarama çizgileri, ekran titreme efektleri ve klasik terminal görünümünü yansıtan monokromatik yeşil renk şeması bulunur.',
        technologies: 'Kullanılan Teknolojiler:',
        techList: 'React, TypeScript, Styled Components, CSS Animasyonları, HTML5, Duyarlı Tasarım'
      }
    },
    certificates: {
      webDevBootcamp: {
        title: 'The Web Developer Bootcamp 2025',
        issuer: 'Udemy'
      },
      nodeBootcamp: {
        title: 'Node.js, Express, MongoDB & More: The Complete Bootcamp',
        issuer: 'Udemy'
      },
      frontendDev: {
        title: 'Başlangıç Seviyesi Frontend Web Geliştirme',
        issuer: 'Patika.dev'
      }
    }
  }
};

function App() {
  // Initialize state from localStorage or defaults
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    status: false,
    skills: false,
    experience: false,
    education: false,
    projects: false,
    certificates: false,
    contact: false,
    tdkt: false,
    turker: false,
    'job-platform': false,
    'book-platform': false,
    'task-tracker': false,
    'portfolio': false
  });

  const [activeContact, setActiveContact] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(() => {
    const savedAudio = localStorage.getItem('audioEnabled');
    const initialAudioState = savedAudio ? JSON.parse(savedAudio) : !getMuteState();
    // Initialize audio state to match the stored state
    if (!initialAudioState) {
      toggleMute(); // Mute if stored state is false
    }
    return initialAudioState;
  });
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    const savedTheme = localStorage.getItem('colorTheme');
    return (savedTheme as ColorTheme) || 'green';
  });
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage as Language) || 'en';
  });
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('audioEnabled', JSON.stringify(isAudioEnabled));
  }, [isAudioEnabled]);

  useEffect(() => {
    localStorage.setItem('colorTheme', colorTheme);
  }, [colorTheme]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const contactInfo: { [key: string]: ContactInfo } = {
    email: {
      icon: '✉',
      label: translations[language].contactInfo.email.label,
      info: translations[language].contactInfo.email.info,
      link: 'mailto:mustafagolec1616@gmail.com'
    },
    location: {
      icon: '📍',
      label: translations[language].contactInfo.location.label,
      info: translations[language].contactInfo.location.info,
      link: 'https://maps.app.goo.gl/yZ5BfDyQDeYSnSc98'
    },
    linkedin: {
      icon: '💼',
      label: translations[language].contactInfo.linkedin.label,
      info: translations[language].contactInfo.linkedin.info,
      link: 'https://www.linkedin.com/in/mustafa-golec/'
    },
    github: {
      icon: '👨‍💻',
      label: translations[language].contactInfo.github.label,
      info: translations[language].contactInfo.github.info,
      link: 'https://github.com/mustafagolec'
    },
    scholar: {
      icon: '🎓',
      label: translations[language].contactInfo.scholar.label,
      info: translations[language].contactInfo.scholar.info,
      link: 'https://scholar.google.com/citations?user=IJwDPgQAAAAJ&hl=tr'
    },
    youtube: {
      icon: '🎥',
      label: translations[language].contactInfo.youtube.label,
      info: translations[language].contactInfo.youtube.info,
      link: 'https://www.youtube.com/@mustafagolec'
    }
  };

  // Initialize audio when the component mounts
  useEffect(() => {
    // Initialize audio on first user interaction
    const initAudio = () => {
      initializeAudio();
      // Ensure audio state matches the stored state
      if (!isAudioEnabled) {
        toggleMute();
      }
      document.removeEventListener('click', initAudio);
    };
    document.addEventListener('click', initAudio);
    return () => document.removeEventListener('click', initAudio);
  }, [isAudioEnabled]);

  // Update CSS variables when theme changes
  useEffect(() => {
    const root = document.documentElement;
    const colors = themeColors[colorTheme];
    
    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--theme-background', colors.background);
    root.style.setProperty('--theme-text', colors.text);
    root.style.setProperty('--theme-glow', colors.glow);
    root.style.setProperty('--theme-hover', colors.hover);
    root.style.setProperty('--theme-border', colors.border);
  }, [colorTheme]);

  const toggleSection = (section: string) => {
    // Play different sounds for opening and closing
    const isCurrentlyOpen = expandedSections[section];
    playSound(isCurrentlyOpen ? 'close' : 'click');

    setExpandedSections(prev => {
      const newState = {
        ...prev,
        [section]: !prev[section]
      };
      
      // Reset activeContact when contact section is collapsed
      if (section === 'contact' && newState[section] === false) {
        setActiveContact(null);
      }
      
      return newState;
    });
  };

  const handleContactClick = (contactType: string) => {
    playSound('select');
    setActiveContact(contactType);
    if (!expandedSections.contact) {
      setExpandedSections(prev => ({
        ...prev,
        contact: true
      }));
    }
  };

  const handleAudioToggle = () => {
    const newMuteState = toggleMute();
    setIsAudioEnabled(!newMuteState);
    playSound('select');
  };

  const handleThemeChange = (theme: ColorTheme) => {
    setColorTheme(theme);
    setIsThemeMenuOpen(false);
    playSound('select');
  };

  const toggleThemeMenu = () => {
    setIsThemeMenuOpen(!isThemeMenuOpen);
    playSound('click');
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setIsLanguageMenuOpen(false);
    playSound('select');
  };

  const toggleLanguageMenu = () => {
    setIsLanguageMenuOpen(!isLanguageMenuOpen);
    playSound('click');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    playSound('click');
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('#theme-menu-container')) {
        setIsThemeMenuOpen(false);
      }
      if (!target.closest('#language-menu-container')) {
        setIsLanguageMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const sections: { [key: string]: SectionData } = {
    contact: {
      title: translations[language].sections.contact.title,
      items: [
        <ContactButtonsContainer>
          {Object.entries(contactInfo).map(([key, info]) => (
            <ContactButton
              key={key}
              className={activeContact === key ? 'active' : ''}
              onClick={() => handleContactClick(key)}
              isCollapsed={!expandedSections.contact}
            >
              <span style={{ fontSize: expandedSections.contact ? '1.5em' : '1.2em' }}>{info.icon}</span>
              <span>{info.label}</span>
            </ContactButton>
          ))}
        </ContactButtonsContainer>,
        ...(expandedSections.contact ? [
          <ContactInfoArea key="info">
            <ContactListItem>
              <ContactInfoText>
                {activeContact && contactInfo[activeContact].link ? (
                  <ContactLink href={contactInfo[activeContact].link} target="_blank" rel="noopener noreferrer">
                    {contactInfo[activeContact].info}
                  </ContactLink>
                ) : activeContact ? (
                  contactInfo[activeContact].info
                ) : (
                  translations[language].selectContact
                )}
              </ContactInfoText>
            </ContactListItem>
          </ContactInfoArea>
        ] : [])
      ]
    },
    status: {
      title: translations[language].sections.status.title,
      items: translations[language].sections.status.items
    },
    skills: {
      title: translations[language].sections.skills.title,
      items: translations[language].sections.skills.items
    },
    experience: {
      title: translations[language].sections.experience.title,
      items: [
        <ExperienceItem key="tdkt">
          <ExperienceHeader onClick={() => toggleSection('tdkt')}>
            <div>
              <div style={{ marginBottom: '5px' }}>{language === 'tr' ? 'Ekim 2023 - Günümüz' : 'October 2023 - Present'}</div>
              <ExperienceTitle>{translations[language].experience.tdkt.title}</ExperienceTitle>
              <ExperienceDetails>
                <div>{translations[language].experience.tdkt.role}</div>
                {expandedSections['tdkt'] && (
                  <div>{translations[language].experience.tdkt.location}</div>
                )}
              </ExperienceDetails>
            </div>
            <ExpandIcon isExpanded={expandedSections['tdkt']}>▶</ExpandIcon>
          </ExperienceHeader>
          <SectionContent isExpanded={expandedSections['tdkt']}>
            <List>
              {translations[language].experience.tdkt.items.map((item, index) => (
                <ListItem key={index}>{item}</ListItem>
              ))}
            </List>
          </SectionContent>
        </ExperienceItem>,
        <ExperienceItem key="turker">
          <ExperienceHeader onClick={() => toggleSection('turker')}>
            <div>
              <div style={{ marginBottom: '5px' }}>{language === 'tr' ? 'Haziran 2022 - Ağustos 2022' : 'June 2022 - August 2022'}</div>
              <ExperienceTitle>{translations[language].experience.turker.title}</ExperienceTitle>
              <ExperienceDetails>
                <div>{translations[language].experience.turker.role}</div>
                {expandedSections['turker'] && (
                  <div>{translations[language].experience.turker.location}</div>
                )}
              </ExperienceDetails>
            </div>
            <ExpandIcon isExpanded={expandedSections['turker']}>▶</ExpandIcon>
          </ExperienceHeader>
          <SectionContent isExpanded={expandedSections['turker']}>
            <List>
              {translations[language].experience.turker.items.map((item, index) => (
                <ListItem key={index}>{item}</ListItem>
              ))}
            </List>
          </SectionContent>
        </ExperienceItem>
      ]
    },
    education: {
      title: translations[language].sections.education.title,
      items: [
        <ExperienceItem key="master">
          <div>
            <div style={{ marginBottom: '5px' }}>{language === 'tr' ? 'Ağustos 2024 - Günümüz' : 'Aug 2024 - Present'}</div>
            <ExperienceTitle>{translations[language].education.master.title}</ExperienceTitle>
            <ExperienceDetails>
              <div>{translations[language].education.master.degree}</div>
              <div>{translations[language].education.master.location}</div>
            </ExperienceDetails>
          </div>
        </ExperienceItem>,
        <ExperienceItem key="bachelor">
          <div>
            <div style={{ marginBottom: '5px' }}>{language === 'tr' ? 'Eylül 2019 - Haziran 2023' : 'Sep 2019 - June 2023'}</div>
            <ExperienceTitle>{translations[language].education.bachelor.title}</ExperienceTitle>
            <ExperienceDetails>
              <div>{translations[language].education.bachelor.degree}</div>
              <div>{translations[language].education.bachelor.location}</div>
              <div>{translations[language].education.bachelor.gpa}</div>
            </ExperienceDetails>
          </div>
        </ExperienceItem>
      ]
    },
    projects: {
      title: translations[language].sections.projects.title,
      items: [
        <ExperienceItem key="job-platform">
          <ExperienceHeader onClick={() => toggleSection('job-platform')}>
            <div>
              <ExperienceTitle>{translations[language].projects.jobPlatform.title}</ExperienceTitle>
              <ExperienceDetails>
                <div>{translations[language].projects.jobPlatform.description}</div>
              </ExperienceDetails>
            </div>
            <ExpandIcon isExpanded={expandedSections['job-platform']}>▶</ExpandIcon>
          </ExperienceHeader>
          <SectionContent isExpanded={expandedSections['job-platform']}>
            <List>
              <ListItem>{translations[language].projects.jobPlatform.details}</ListItem>
              <ListItem style={{ marginTop: '15px', fontWeight: 'bold' }}>{translations[language].projects.jobPlatform.technologies}</ListItem>
              <ListItem>{translations[language].projects.jobPlatform.techList}</ListItem>
            </List>
          </SectionContent>
        </ExperienceItem>,
        <ExperienceItem key="book-platform">
          <ExperienceHeader onClick={() => toggleSection('book-platform')}>
            <div>
              <ExperienceTitle>{translations[language].projects.bookPlatform.title}</ExperienceTitle>
              <ExperienceDetails>
                <div>{translations[language].projects.bookPlatform.description}</div>
              </ExperienceDetails>
            </div>
            <ExpandIcon isExpanded={expandedSections['book-platform']}>▶</ExpandIcon>
          </ExperienceHeader>
          <SectionContent isExpanded={expandedSections['book-platform']}>
            <List>
              <ListItem>{translations[language].projects.bookPlatform.details}</ListItem>
              <ListItem style={{ marginTop: '15px', fontWeight: 'bold' }}>{translations[language].projects.bookPlatform.technologies}</ListItem>
              <ListItem>{translations[language].projects.bookPlatform.techList}</ListItem>
            </List>
          </SectionContent>
        </ExperienceItem>,
        <ExperienceItem key="task-tracker">
          <ExperienceHeader onClick={() => toggleSection('task-tracker')}>
            <div>
              <ExperienceTitle>{translations[language].projects.taskTracker.title}</ExperienceTitle>
              <ExperienceDetails>
                <div>{translations[language].projects.taskTracker.description}</div>
              </ExperienceDetails>
            </div>
            <ExpandIcon isExpanded={expandedSections['task-tracker']}>▶</ExpandIcon>
          </ExperienceHeader>
          <SectionContent isExpanded={expandedSections['task-tracker']}>
            <List>
              <ListItem>{translations[language].projects.taskTracker.details}</ListItem>
              <ListItem style={{ marginTop: '15px', fontWeight: 'bold' }}>{translations[language].projects.taskTracker.technologies}</ListItem>
              <ListItem>{translations[language].projects.taskTracker.techList}</ListItem>
            </List>
          </SectionContent>
        </ExperienceItem>,
        <ExperienceItem key="portfolio">
          <ExperienceHeader onClick={() => toggleSection('portfolio')}>
            <div>
              <ExperienceTitle>{translations[language].projects.portfolio.title}</ExperienceTitle>
              <ExperienceDetails>
                <div>{translations[language].projects.portfolio.description}</div>
              </ExperienceDetails>
            </div>
            <ExpandIcon isExpanded={expandedSections['portfolio']}>▶</ExpandIcon>
          </ExperienceHeader>
          <SectionContent isExpanded={expandedSections['portfolio']}>
            <List>
              <ListItem>{translations[language].projects.portfolio.details}</ListItem>
              <ListItem style={{ marginTop: '15px', fontWeight: 'bold' }}>{translations[language].projects.portfolio.technologies}</ListItem>
              <ListItem>{translations[language].projects.portfolio.techList}</ListItem>
            </List>
          </SectionContent>
        </ExperienceItem>
      ]
    },
    certificates: {
      title: translations[language].sections.certificates.title,
      items: [
        <ExperienceItem key="web-dev-bootcamp">
          <div>
            <div style={{ marginBottom: '5px' }}>{language === 'tr' ? 'Şubat 2025' : 'Feb 2025'}</div>
            <ExperienceTitle>{translations[language].certificates.webDevBootcamp.title}</ExperienceTitle>
            <ExperienceDetails>
              <div>{translations[language].certificates.webDevBootcamp.issuer}</div>
            </ExperienceDetails>
          </div>
        </ExperienceItem>,
        <ExperienceItem key="node-bootcamp">
          <div>
            <div style={{ marginBottom: '5px' }}>{language === 'tr' ? 'Aralık 2024' : 'Dec 2024'}</div>
            <ExperienceTitle>{translations[language].certificates.nodeBootcamp.title}</ExperienceTitle>
            <ExperienceDetails>
              <div>{translations[language].certificates.nodeBootcamp.issuer}</div>
            </ExperienceDetails>
          </div>
        </ExperienceItem>,
        <ExperienceItem key="frontend-dev">
          <div>
            <div style={{ marginBottom: '5px' }}>{language === 'tr' ? 'Mayıs 2022' : 'May 2022'}</div>
            <ExperienceTitle>{translations[language].certificates.frontendDev.title}</ExperienceTitle>
            <ExperienceDetails>
              <div>{translations[language].certificates.frontendDev.issuer}</div>
            </ExperienceDetails>
          </div>
        </ExperienceItem>
      ]
    }
  };

  const renderFlag = (Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>) => {
    const FlagComponent = Icon;
    return <FlagComponent />;
  };

  return (
    <ThemeProvider theme={themeColors[colorTheme] as unknown as DefaultTheme}>
      <AppContainer>
        <PageHeader>
          {translations[language].pageHeader}
        </PageHeader>
        <PipBoyContainer>
          <PipBoyScreen>
            <Header>
              <HeaderText>
                <Title>Mustafa Göleç</Title>
                <Subtitle>{translations[language].subtitle}</Subtitle>
              </HeaderText>
              <ProfileImage src="/portfolio/mg-profile.jpg" alt="Profile" />
            </Header>

            {Object.entries(sections).map(([key, section]) => (
              <Section key={key}>
                <SectionTitle onClick={() => toggleSection(key)}>
                  {section.title}
                  <ExpandIcon isExpanded={expandedSections[key]}>▶</ExpandIcon>
                </SectionTitle>
                {key === 'contact' ? (
                  <>
                    <ContactButtonsContainer>
                      {Object.entries(contactInfo).map(([contactKey, info]) => (
                        <ContactButton
                          key={contactKey}
                          className={activeContact === contactKey ? 'active' : ''}
                          onClick={() => handleContactClick(contactKey)}
                          isCollapsed={!expandedSections.contact}
                        >
                          <span style={{ fontSize: expandedSections.contact ? '1.5em' : '1.2em' }}>{info.icon}</span>
                          <span>{info.label}</span>
                        </ContactButton>
                      ))}
                    </ContactButtonsContainer>
                    <SectionContent isExpanded={expandedSections.contact}>
                      <ContactInfoArea>
                        <ContactListItem>
                          <ContactInfoText>
                            {activeContact && contactInfo[activeContact].link ? (
                              <ContactLink href={contactInfo[activeContact].link} target="_blank" rel="noopener noreferrer">
                                {contactInfo[activeContact].info}
                              </ContactLink>
                            ) : activeContact ? (
                              contactInfo[activeContact].info
                            ) : (
                              translations[language].selectContact
                            )}
                          </ContactInfoText>
                        </ContactListItem>
                      </ContactInfoArea>
                    </SectionContent>
                  </>
                ) : (
                  <SectionContent isExpanded={expandedSections[key]}>
                    <List>
                      {Array.isArray(section.items) && section.items.map((item, index) => (
                        <ListItem key={index}>{item}</ListItem>
                      ))}
                    </List>
                  </SectionContent>
                )}
              </Section>
            ))}
            <DownloadCVButton href={language === 'en' ? "/portfolio/Mustafa_Golec_EN.pdf" : "/portfolio/Mustafa_Golec_TR.pdf"} target="_blank" rel="noopener noreferrer">
              {translations[language].downloadCV}
            </DownloadCVButton>
          </PipBoyScreen>
        </PipBoyContainer>
        <CopyrightText>
          {translations[language].copyright}
        </CopyrightText>
        <CreditsText>
          {translations[language].credits.map((credit, index) => (
            <React.Fragment key={index}>
              {credit}
              {index < translations[language].credits.length - 1 && <br />}
            </React.Fragment>
          ))}
        </CreditsText>
        <StickyFooter>
          <MobileMenuButton onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? `▼ ${translations[language].systemControls}` : `▲ ${translations[language].systemControls}`}
          </MobileMenuButton>
          <MobileMenuContent isOpen={isMobileMenuOpen}>
            <FooterSection>
              <MenuContainer>
                <SettingsMenuContainer id="theme-menu-container">
                  <SettingsToggle 
                    onClick={toggleThemeMenu}
                    isActive={isThemeMenuOpen}
                  >
                    {themeIcons[colorTheme]} {translations[language].colorThemes[colorTheme]}
                  </SettingsToggle>
                  <SettingsMenu isOpen={isThemeMenuOpen}>
                    {(Object.keys(themeColors) as ColorTheme[]).map(theme => (
                      <SettingsOption
                        key={theme}
                        onClick={() => handleThemeChange(theme)}
                        isActive={colorTheme === theme}
                      >
                        {themeIcons[theme]} {translations[language].colorThemes[theme]}
                      </SettingsOption>
                    ))}
                  </SettingsMenu>
                </SettingsMenuContainer>

                <SettingsMenuContainer id="language-menu-container">
                  <SettingsToggle 
                    onClick={toggleLanguageMenu}
                    isActive={isLanguageMenuOpen}
                  >
                    <FlagIcon>
                      {renderFlag(languageNames[language].icon)}
                    </FlagIcon>
                    {language === 'en' ? 'ENGLISH' : 'TÜRKÇE'}
                  </SettingsToggle>
                  <SettingsMenu isOpen={isLanguageMenuOpen}>
                    {(Object.keys(languageNames) as Language[]).map(lang => {
                      const { icon: Icon } = languageNames[lang];
                      return (
                        <SettingsOption
                          key={lang}
                          onClick={() => handleLanguageChange(lang)}
                          isActive={language === lang}
                        >
                          <FlagIcon isActive={language === lang}>
                            {renderFlag(Icon)}
                          </FlagIcon>
                          {lang === 'en' ? 'ENGLISH' : 'TÜRKÇE'}
                        </SettingsOption>
                      );
                    })}
                  </SettingsMenu>
                </SettingsMenuContainer>
              </MenuContainer>
            </FooterSection>
            <CenterSection>
              <FooterText>{translations[language].systemControls}</FooterText>
            </CenterSection>
            <FooterSection>
              <ControlButton 
                onClick={handleAudioToggle}
                isActive={isAudioEnabled}
              >
                {isAudioEnabled ? translations[language].audioOn : translations[language].audioOff}
              </ControlButton>
            </FooterSection>
          </MobileMenuContent>
        </StickyFooter>
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;
