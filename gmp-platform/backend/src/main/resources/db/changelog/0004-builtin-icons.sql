--liquibase formatted sql
--changeset edhr:0004-builtin-icons

ALTER TABLE icon_asset ADD COLUMN IF NOT EXISTS builtin_key VARCHAR(128);
ALTER TABLE icon_asset ALTER COLUMN file_id DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uk_icon_asset_builtin_key
ON icon_asset(tenant_id, builtin_key)
WHERE source = 'BUILTIN' AND builtin_key IS NOT NULL;

INSERT INTO icon_group (id, tenant_id, name, sort_order, created_by, created_at)
SELECT nextval('hibernate_sequence'), 'default', '系统内置图标', 1, 'system', CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM icon_group WHERE tenant_id = 'default' AND name = '系统内置图标'
);

WITH builtin_group AS (
    SELECT id FROM icon_group WHERE tenant_id = 'default' AND name = '系统内置图标' LIMIT 1
),
builtin_icons(builtin_key, name, tags, sort_order) AS (
    VALUES
        ('AccountTree', 'Account Tree', '系统,内置,AccountTree', 1),
        ('Add', 'Add', '系统,内置,Add', 2),
        ('AddBox', 'Add Box', '系统,内置,AddBox', 3),
        ('Apartment', 'Apartment', '系统,内置,Apartment', 4),
        ('AppsRounded', 'Apps Rounded', '系统,内置,AppsRounded', 5),
        ('ArrowBack', 'Arrow Back', '系统,内置,ArrowBack', 6),
        ('ArrowForward', 'Arrow Forward', '系统,内置,ArrowForward', 7),
        ('Assessment', 'Assessment', '系统,内置,Assessment', 8),
        ('Assignment', 'Assignment', '系统,内置,Assignment', 9),
        ('Business', 'Business', '系统,内置,Business', 10),
        ('CallSplit', 'Call Split', '系统,内置,CallSplit', 11),
        ('Cancel', 'Cancel', '系统,内置,Cancel', 12),
        ('CheckCircle', 'Check Circle', '系统,内置,CheckCircle', 13),
        ('ChevronLeftRounded', 'Chevron Left Rounded', '系统,内置,ChevronLeftRounded', 14),
        ('Close', 'Close', '系统,内置,Close', 15),
        ('CloseRounded', 'Close Rounded', '系统,内置,CloseRounded', 16),
        ('ColorLensOutlined', 'Color Lens Outlined', '系统,内置,ColorLensOutlined', 17),
        ('ContentCopy', 'Content Copy', '系统,内置,ContentCopy', 18),
        ('Dashboard', 'Dashboard', '系统,内置,Dashboard', 19),
        ('Dataset', 'Dataset', '系统,内置,Dataset', 20),
        ('Delete', 'Delete', '系统,内置,Delete', 21),
        ('DeleteOutline', 'Delete Outline', '系统,内置,DeleteOutline', 22),
        ('DesignServices', 'Design Services', '系统,内置,DesignServices', 23),
        ('Done', 'Done', '系统,内置,Done', 24),
        ('DoneAll', 'Done All', '系统,内置,DoneAll', 25),
        ('Download', 'Download', '系统,内置,Download', 26),
        ('DragIndicator', 'Drag Indicator', '系统,内置,DragIndicator', 27),
        ('DriveFileMove', 'Drive File Move', '系统,内置,DriveFileMove', 28),
        ('Edit', 'Edit', '系统,内置,Edit', 29),
        ('ErrorOutline', 'Error Outline', '系统,内置,ErrorOutline', 30),
        ('ExpandLess', 'Expand Less', '系统,内置,ExpandLess', 31),
        ('ExpandMore', 'Expand More', '系统,内置,ExpandMore', 32),
        ('FactCheck', 'Fact Check', '系统,内置,FactCheck', 33),
        ('FileDownload', 'File Download', '系统,内置,FileDownload', 34),
        ('FileUpload', 'File Upload', '系统,内置,FileUpload', 35),
        ('Folder', 'Folder', '系统,内置,Folder', 36),
        ('Forward', 'Forward', '系统,内置,Forward', 37),
        ('FullscreenRounded', 'Fullscreen Rounded', '系统,内置,FullscreenRounded', 38),
        ('Groups', 'Groups', '系统,内置,Groups', 39),
        ('Home', 'Home', '系统,内置,Home', 40),
        ('ImageOutlined', 'Image Outlined', '系统,内置,ImageOutlined', 41),
        ('InboxOutlined', 'Inbox Outlined', '系统,内置,InboxOutlined', 42),
        ('KeyboardArrowDownRounded', 'Keyboard Arrow Down Rounded', '系统,内置,KeyboardArrowDownRounded', 43),
        ('LocalHospitalRounded', 'Local Hospital Rounded', '系统,内置,LocalHospitalRounded', 44),
        ('LockOutlined', 'Lock Outlined', '系统,内置,LockOutlined', 45),
        ('LockReset', 'Lock Reset', '系统,内置,LockReset', 46),
        ('Logout', 'Logout', '系统,内置,Logout', 47),
        ('MoreHoriz', 'More Horiz', '系统,内置,MoreHoriz', 48),
        ('NavigateNext', 'Navigate Next', '系统,内置,NavigateNext', 49),
        ('NavigateNextRounded', 'Navigate Next Rounded', '系统,内置,NavigateNextRounded', 50),
        ('Notifications', 'Notifications', '系统,内置,Notifications', 51),
        ('PendingActions', 'Pending Actions', '系统,内置,PendingActions', 52),
        ('PersonOutline', 'Person Outline', '系统,内置,PersonOutline', 53),
        ('PersonOutlineRounded', 'Person Outline Rounded', '系统,内置,PersonOutlineRounded', 54),
        ('PersonRemove', 'Person Remove', '系统,内置,PersonRemove', 55),
        ('PlayArrow', 'Play Arrow', '系统,内置,PlayArrow', 56),
        ('PlaylistAdd', 'Playlist Add', '系统,内置,PlaylistAdd', 57),
        ('PrecisionManufacturing', 'Precision Manufacturing', '系统,内置,PrecisionManufacturing', 58),
        ('Print', 'Print', '系统,内置,Print', 59),
        ('Publish', 'Publish', '系统,内置,Publish', 60),
        ('QrCodeScanner', 'Qr Code Scanner', '系统,内置,QrCodeScanner', 61),
        ('RefreshRounded', 'Refresh Rounded', '系统,内置,RefreshRounded', 62),
        ('RestartAlt', 'Restart Alt', '系统,内置,RestartAlt', 63),
        ('RocketLaunch', 'Rocket Launch', '系统,内置,RocketLaunch', 64),
        ('Route', 'Route', '系统,内置,Route', 65),
        ('Rule', 'Rule', '系统,内置,Rule', 66),
        ('Save', 'Save', '系统,内置,Save', 67),
        ('Search', 'Search', '系统,内置,Search', 68),
        ('SearchRounded', 'Search Rounded', '系统,内置,SearchRounded', 69),
        ('Send', 'Send', '系统,内置,Send', 70),
        ('Settings', 'Settings', '系统,内置,Settings', 71),
        ('Storage', 'Storage', '系统,内置,Storage', 72),
        ('SubdirectoryArrowRight', 'Subdirectory Arrow Right', '系统,内置,SubdirectoryArrowRight', 73),
        ('Summarize', 'Summarize', '系统,内置,Summarize', 74),
        ('SwapHoriz', 'Swap Horiz', '系统,内置,SwapHoriz', 75),
        ('TranslateRounded', 'Translate Rounded', '系统,内置,TranslateRounded', 76),
        ('TrendingUp', 'Trending Up', '系统,内置,TrendingUp', 77),
        ('TuneRounded', 'Tune Rounded', '系统,内置,TuneRounded', 78),
        ('Undo', 'Undo', '系统,内置,Undo', 79),
        ('Unpublished', 'Unpublished', '系统,内置,Unpublished', 80),
        ('UploadFile', 'Upload File', '系统,内置,UploadFile', 81),
        ('ViewColumnRounded', 'View Column Rounded', '系统,内置,ViewColumnRounded', 82),
        ('Visibility', 'Visibility', '系统,内置,Visibility', 83),
        ('WarningAmberOutlined', 'Warning Amber Outlined', '系统,内置,WarningAmberOutlined', 84)
)
INSERT INTO icon_asset (id, tenant_id, group_id, file_id, name, builtin_key, tags, source, sort_order, created_by, created_at)
SELECT nextval('hibernate_sequence'), 'default', g.id, NULL, i.name, i.builtin_key, i.tags, 'BUILTIN', i.sort_order, 'system', CURRENT_TIMESTAMP
FROM builtin_icons i
CROSS JOIN builtin_group g
WHERE NOT EXISTS (
    SELECT 1
    FROM icon_asset a
    WHERE a.tenant_id = 'default'
      AND a.source = 'BUILTIN'
      AND a.builtin_key = i.builtin_key
);
