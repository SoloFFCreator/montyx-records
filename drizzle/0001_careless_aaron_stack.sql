CREATE TABLE `artistLinks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`platform` varchar(80) NOT NULL,
	`kind` enum('streaming','social','video','other') NOT NULL DEFAULT 'social',
	`url` varchar(1024) NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isPublic` boolean NOT NULL DEFAULT false,
	CONSTRAINT `artistLinks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `artists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`slug` varchar(180) NOT NULL,
	`biography` text NOT NULL,
	`genres` json NOT NULL,
	`photoUrl` varchar(1024),
	`isPublic` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artists_id` PRIMARY KEY(`id`),
	CONSTRAINT `artists_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `contactRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`subject` varchar(200) NOT NULL,
	`message` text NOT NULL,
	`ipHash` varchar(64) NOT NULL,
	`status` enum('new','in_review','resolved') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contactRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platformLinks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`releaseId` int NOT NULL,
	`platform` varchar(80) NOT NULL,
	`url` varchar(1024) NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isPublic` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `platformLinks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `releases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`slug` varchar(180) NOT NULL,
	`title` varchar(200) NOT NULL,
	`releaseType` enum('single','ep','album') NOT NULL DEFAULT 'single',
	`releaseDate` date,
	`genres` json NOT NULL,
	`description` text,
	`coverUrl` varchar(1024),
	`coverKey` varchar(512),
	`publicationStatus` enum('draft','published') NOT NULL DEFAULT 'draft',
	`distributionStatus` enum('pending','scheduled','live','taken_down') NOT NULL DEFAULT 'pending',
	`featured` boolean NOT NULL DEFAULT false,
	`isrc` varchar(32),
	`upcEan` varchar(32),
	`distributorName` varchar(200),
	`deliveryReference` varchar(500),
	`labelCredit` varchar(200),
	`masterOwnershipNotes` text,
	`internalNotes` text,
	`audioMasterKey` varchar(512),
	`officialVideoUrl` varchar(1024),
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `releases_id` PRIMARY KEY(`id`),
	CONSTRAINT `releases_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `siteSettings` (
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteSettings_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
ALTER TABLE `artistLinks` ADD CONSTRAINT `artistLinks_artistId_artists_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artists`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `platformLinks` ADD CONSTRAINT `platformLinks_releaseId_releases_id_fk` FOREIGN KEY (`releaseId`) REFERENCES `releases`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `releases` ADD CONSTRAINT `releases_artistId_artists_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artists`(`id`) ON DELETE cascade ON UPDATE no action;