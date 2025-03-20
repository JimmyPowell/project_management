create table milestones
(
    id          bigint unsigned auto_increment
        primary key,
    title       varchar(255)  not null,
    date        datetime(3)   null,
    description varchar(1000) null,
    created_at  datetime(3)   null,
    updated_at  datetime(3)   null
);

create table refresh_tokens
(
    id         bigint unsigned auto_increment
        primary key,
    user_id    bigint unsigned not null,
    token      varchar(255)    not null,
    expires_at datetime(3)     not null,
    created_at datetime(3)     null,
    constraint uni_refresh_tokens_token
        unique (token)
);

create table tasks
(
    id         bigint unsigned auto_increment
        primary key,
    name       varchar(255)                 not null,
    deadline   datetime(3)                  null,
    status     varchar(20) default '待处理' not null,
    urgency    varchar(20) default '中'     not null,
    assignee   varchar(50)                  null,
    created_at datetime(3)                  null,
    updated_at datetime(3)                  null
);

create table users
(
    id         bigint unsigned auto_increment
        primary key,
    username   varchar(50)  not null,
    password   varchar(100) not null,
    name       varchar(50)  null,
    created_at datetime(3)  null,
    updated_at datetime(3)  null,
    constraint uni_users_username
        unique (username)
);

