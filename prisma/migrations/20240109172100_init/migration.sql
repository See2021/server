-- CreateTable
CREATE TABLE `Farm` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `farm_name` VARCHAR(255) NOT NULL,
    `farm_location` VARCHAR(255) NOT NULL,
    `farm_province` VARCHAR(255) NOT NULL,
    `farm_durian_species` VARCHAR(255) NOT NULL,
    `farm_photo` VARCHAR(191) NULL,
    `farm_status` BOOLEAN NOT NULL,
    `farm_pollination_date` DATETIME(3) NOT NULL,
    `farm_tree` INTEGER NOT NULL,
    `farm_space` INTEGER NOT NULL,
    `latitude` DOUBLE NOT NULL,
    `longtitude` DOUBLE NOT NULL,
    `duian_amount` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tree` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `farm_id` INTEGER NOT NULL,
    `tree_collected` INTEGER NULL DEFAULT 0,
    `tree_ready` INTEGER NULL DEFAULT 0,
    `tree_notReady` INTEGER NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Prediction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `farm_id` INTEGER NOT NULL,
    `tree_id` INTEGER NOT NULL,
    `tree_ready_amount` INTEGER NOT NULL,
    `tree_ready_in` DATETIME(3) NOT NULL,
    `change` INTEGER NOT NULL,
    `percent_change` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(50) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_role` INTEGER NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserFarmTable` (
    `user_farm_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `farm_id` INTEGER NOT NULL,

    PRIMARY KEY (`user_farm_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Disease` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `farm_id` INTEGER NOT NULL,
    `tree_id` INTEGER NOT NULL,
    `disease` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TreePhoto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tree_id` INTEGER NOT NULL,
    `tree_photo_path` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Tree` ADD CONSTRAINT `Tree_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `Farm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prediction` ADD CONSTRAINT `Prediction_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `Farm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prediction` ADD CONSTRAINT `Prediction_tree_id_fkey` FOREIGN KEY (`tree_id`) REFERENCES `Tree`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserFarmTable` ADD CONSTRAINT `UserFarmTable_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserFarmTable` ADD CONSTRAINT `UserFarmTable_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `Farm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Disease` ADD CONSTRAINT `Disease_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `Farm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Disease` ADD CONSTRAINT `Disease_tree_id_fkey` FOREIGN KEY (`tree_id`) REFERENCES `Tree`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TreePhoto` ADD CONSTRAINT `TreePhoto_tree_id_fkey` FOREIGN KEY (`tree_id`) REFERENCES `Tree`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
