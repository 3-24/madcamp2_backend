CREATE DATABASE IF NOT EXISTS `nodelogin` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `nodelogin`;

CREATE TABLE IF NOT EXISTS `accounts` (
  `email` varchar(127) NOT NULL,
  `password` varchar(255),
  `nickname` varchar(127),
  `profile_photo` varchar(255),
  `intro` varchar(255)
);

CREATE TABLE IF NOT EXISTS `posts` (
  `email` varchar(127) NOT NULL,
  `title` varchar(127) NOT NULL,
  `content` varchar(1023) NOT NULL,
  `date` INT NOT NULL,
  `photo1` varchar(255),
  `photo2` varchar(255),
  `photo3` varchar(255)
);

CREATE TABLE IF NOT EXISTS `friends` (
  `me` varchar(127) NOT NULL,
  `target` varchar(127) NOT NULL
)