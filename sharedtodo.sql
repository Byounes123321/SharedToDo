-- phpMyAdmin SQL Dump
-- version 5.1.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 18, 2023 at 08:43 PM
-- Server version: 5.7.24
-- PHP Version: 8.0.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sharedtodo`
--

-- --------------------------------------------------------

--
-- Table structure for table `lists`
--

CREATE TABLE `lists` (
  `L_ID` int(11) NOT NULL,
  `Title` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `lists`
--

INSERT INTO `lists` (`L_ID`, `Title`) VALUES
(49, 'test tasks'),
(50, 'list'),
(51, 'newlsit'),
(52, 'hello'),
(53, 'okay?'),
(55, 'SharedToDo'),
(56, 'Test list');

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `T_ID` int(11) NOT NULL,
  `taskName` varchar(255) NOT NULL,
  `Done` tinyint(1) NOT NULL DEFAULT '0',
  `L_ID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`T_ID`, `taskName`, `Done`, `L_ID`) VALUES
(171, 'Add google auth', 0, 55),
(172, 'make look nice', 0, 55),
(173, 'add extra security', 0, 55),
(174, 'add social features', 0, 55),
(180, 'afa', 1, 56),
(181, 'adf', 0, 56),
(182, 'daf', 0, 56),
(183, 'adsf', 0, 56),
(184, 'adf', 0, 56),
(185, 'adf', 0, 56),
(186, 'adf', 0, 56),
(187, 'adf', 1, 56),
(188, 'afda', 0, 49),
(189, 'fadfdas', 1, 49),
(190, 'dasf', 1, 49),
(191, 'ads', 0, 49),
(192, 'asdf', 0, 49);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `U_ID` int(11) NOT NULL,
  `UserName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `Password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`U_ID`, `UserName`, `email`, `Password`) VALUES
(1, 'Bassil11', 'bassilyounes@gmail.com', '$2b$10$JrgCdcSk3nIMG.q4rq9b9OVTfpkl8ktA/WzPpqJd4.ng8tUPoxyEW'),
(2, 'ppguy', 'gay@gmail.com', '$2b$10$KRJUF8N6YnXSWKMyzy8oGurOJJ9aP6EOSeAMX1tSilPTcpeUHXd5m');

-- --------------------------------------------------------

--
-- Table structure for table `users_lists`
--

CREATE TABLE `users_lists` (
  `ID` int(11) NOT NULL,
  `U_ID` int(11) NOT NULL,
  `L_ID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `users_lists`
--

INSERT INTO `users_lists` (`ID`, `U_ID`, `L_ID`) VALUES
(49, 1, 49),
(50, 1, 50),
(51, 1, 51),
(52, 1, 52),
(53, 1, 53),
(55, 1, 55),
(56, 2, 56),
(57, 1, 56);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `lists`
--
ALTER TABLE `lists`
  ADD PRIMARY KEY (`L_ID`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`T_ID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`U_ID`);

--
-- Indexes for table `users_lists`
--
ALTER TABLE `users_lists`
  ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `lists`
--
ALTER TABLE `lists`
  MODIFY `L_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `T_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=193;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `U_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users_lists`
--
ALTER TABLE `users_lists`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
