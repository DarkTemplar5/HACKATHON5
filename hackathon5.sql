
create database if not exists hackathon5;
go
use hackathon5

drop table if exists VOLUNTEER;
drop table if exists ORG_DONATION;
drop table if exists ORG_DONATED;
drop table if exists DONATION;
drop table if exists DONATED;
drop table if exists PERSON;
drop table if exists ORG;
drop table if exists BANK_INVENTORY;
drop table if exists DIST_INVENTORY;
drop table if exists BANK_LOC;
drop table if exists DIST_LOC;
drop procedure if exists fetch_donation;
drop procedure if exists new_pledge;
drop procedure if exists new_pledge_item;
drop procedure if exists new_donated;
drop procedure if exists update_donation;
drop table if exists REALIAS;
create table if not exists REALIAS
(
    donid         char(36),
    ali_name      integer,
    primary key(donid)
);

create table if not exists PERSON
(    
     pid           char(36),
     phone         char(12)       NOT NULL,-- XXX-XXX-XXXX
     first_name    varchar(20)    NOT NULL,
     last_name     varchar(20)    NOT NULL,
     primary key(pid)
);

create table if not exists VOLUNTEER
(    pid           char(36)        NOT NULL,
     time_avail    char(14)       NOT NULL,-- HH:MM-HH:MM
     primary key(pid, time_avail),
     foreign key(pid) references PERSON(pid)
);

create table if not exists ORG
(     orgname       varchar(40)    NOT NULL,
      phone         char(12)       NOT NULL,-- XXX-XXX-XXXX
      c_first_name  varchar(20)    NOT NULL,
      c_last_name   varchar(20)    NOT NULL,
      primary key(orgname)
);

create table if not exists DONATED
(     pid         char(36)          NOT NULL,
      donid       char(36)          NOT NULL,
      bankname    varchar(40)     NOT NULL,
      primary key(donid),
      foreign key(pid) references PERSON(pid),
      foreign key(donid) references REALIAS(donid)
);

create table if not exists DONATION
(     donid       char(36)              NOT NULL,
      food_type    varchar(20)         NOT NULL,
      quantity_pledged    integer     NOT NULL,
      quantity_donated    integer     NOT NULL,
      primary key(donid,food_type),
      foreign key(donid) references REALIAS(donid)
);

create table if not exists ORG_DONATED
(     orgname     varchar(40)         NOT NULL,
      donid       char(36)             NOT NULL,
      bank_name   varchar(40)         NOT NULL,
      primary key(donid),
      foreign key(orgname) references ORG(orgname),
      foreign key(donid) references REALIAS(donid)
);

create table if not exists BANK_LOC
(     bank_name   varchar(40)         NOT NULL,
      loc         varchar(100)        NOT NULL,
      primary key(bank_name)
);

create table if not exists BANK_INVENTORY
(     bank_name   varchar(40)         NOT NULL,
      food_type   varchar(20)         NOT NULL,
      quantity    integer             NOT NULL,
      primary key(bank_name,food_type),
      foreign key(bank_name) references BANK_LOC(bank_name)
);

create table if not exists DIST_LOC
(     dist_name   varchar(40)         NOT NULL,
      loc         varchar(100)        NOT NULL,
      primary key(dist_name)
);

create table if not exists DIST_INVENTORY
(     dist_name       varchar(40)     NOT NULL,
      food_type       varchar(20)     NOT NULL,
      quantity        integer         NOT NULL,
      quantity_want   integer         NOT NULL,
      primary key(dist_name,food_type),
      foreign key(dist_name) references DIST_LOC(dist_name)
);
insert ignore into BANK_LOC
values("Bank main","4500 S. Cockrell Hill Road Dallas, TX 75236-2028"), 
("Bank unmain","1000 A Lane Richardson, TX 75080");
insert ignore into DIST_LOC
values("distribution 1","1001 B Lane Richardson, TX 75080"),
("distribution 2","1002 B Lane Richardson, TX 75080"),
("distribution 3","1003 B Lane Richardson, TX 75080"),
("distribution 4","1004 B Lane Richardson, TX 75080"),
("distribution 5","1005 B Lane Richardson, TX 75080");
insert ignore into PERSON
values(UUID(),"123-456-7890","Mark","Baker"),
(UUID(),"234-567-8901","David","Sanders"),
(UUID(),"345-678-9012","James","Sanderlin"),
(UUID(),"456-789-0123","Jeffrey","Smith"),
(UUID(),"567-890-1234","Timothy","Hoffman"),
(UUID(),"678-901-2345","Aaron","Hardin");
insert into VOLUNTEER
    select pid,"TU-10:00-13:30" from PERSON
    where first_name="Mark";
insert into VOLUNTEER
    select pid,"SA-10:00-20:00" from PERSON
    where first_name="David";
insert into VOLUNTEER
    select pid,"MO-13:00-15:30" from PERSON
    where first_name="James";
insert into VOLUNTEER
    select pid,"TH-13:00-16:30" from PERSON
    where first_name="James";
insert ignore into ORG
values("organization 1","987-654-3210","Betty","Bop"),
("organization 2","654-321-0987","Bugs","Bunny"),
("organization 3","321-098-7654","Babs","Bunny");
insert ignore into REALIAS
values(UUID(),1),
(UUID(),2),
(UUID(),3),
(UUID(),4),
(UUID(),5),
(UUID(),6),
(UUID(),7),
(UUID(),8),
(UUID(),9),
(UUID(),10);
insert into DONATED
    select pid,donid,"Bank main" from PERSON,REALIAS
    where first_name="Jeffrey" and ali_name="1";
insert into DONATED
   select pid,donid,"Bank main" from PERSON,REALIAS
    where first_name="Timothy" and ali_name="2";
insert into DONATED
    select pid,donid,"Bank unmain" from PERSON,REALIAS
    where first_name="Aaron" and ali_name="3";
insert ignore into DONATION
    select donid,"Pa Grape",42,0 from DONATED
    where pid in (select pid from PERSON
                  where first_name="Jeffrey");
insert ignore into DONATION
    select donid,"Bob tomato",99,1 from DONATED
    where pid in (select pid from PERSON
                  where first_name="Timothy");
insert ignore into DONATION
    select donid,"Mom's Spaghetti",0,999 from DONATED
    where pid in (select pid from PERSON
                  where first_name="Aaron");
insert into DONATION
    select donid,"Dehydrated Water",56,0 from DONATION
    where food_type="Pa Grape" and quantity_pledged=42;
insert into DONATION
    select donid,"Banana",0,3 from DONATION
    where food_type="Mom's Spaghetti" and quantity_pledged=0;
insert into DONATION
    select donid,"Pineapple",7,0 from DONATION
    where food_type="Pa Grape" and quantity_pledged=42;
insert into DONATION
    select donid,"Allergen-free peanuts",0,94 from DONATION
    where food_type="Bob tomato" and quantity_pledged=99;
insert into DONATION
    select donid,"Junior Asparagus",56,0 from DONATION
    where food_type="Bob tomato" and quantity_pledged=99;
insert ignore into BANK_INVENTORY 
values("Bank main","Mom’s Spaghetti",11),
("Bank main", "Junior Asparagus", 12),
("Bank main", "Pa Grape", 13),
("Bank main", "Larry Cucumber", 14),
("Bank main", "Bob tomato", 14),
("Bank unmain", "Pineapple", 22),
("Bank unmain", "Banana", 22),
("Bank unmain", "Dehydrated water", 23),
("Bank unmain", "Allergen-free peanuts", 24);
insert ignore into DIST_INVENTORY 
values("distribution 1", "Mom’s Spaghetti", 111, 10),
("distribution 2", "Mom’s Spaghetti", 222, 20),
("distribution 2", "Junior Asparagus", 22, 2),
("distribution 3", "Mom’s Spaghetti", 333, 30),
("distribution 3", "Banana", 33, 0),
("distribution 4", "Mom’s Spaghetti", 444, 40),
("distribution 4", "Pineapple", 0, 44),
("distribution 5", "Mom’s Spaghetti", 555, 50);
delimiter //
create procedure fetch_donation (in ali varchar(20))
begin
    select food_type,quantity_pledged,quantity_donated from DONATION
        where donid in (select donid from REALIAS
                        where ali_name=ali);
end//
delimiter ;
insert into ORG_DONATED
    select "organization 1",donid,"Bank main" from REALIAS
    where ali_name="4";
insert into ORG_DONATED
    select "organization 1",donid,"Bank main" from REALIAS
    where ali_name="5";
insert into ORG_DONATED
    select "organization 1",donid,"Bank unmain" from REALIAS
    where ali_name="6";
insert into ORG_DONATED
    select "organization 2",donid,"Bank main" from REALIAS
    where ali_name="7";
insert into ORG_DONATED
    select "organization 2",donid,"Bank unmain" from REALIAS
    where ali_name="8";
insert into ORG_DONATED
    select "organization 3",donid,"Bank main" from REALIAS
    where ali_name="9";
insert into ORG_DONATED
    select "organization 3",donid,"Bank unmain" from REALIAS
    where ali_name="10";
    
insert into DONATION
    select donid,"Bob tomato",4000,5000 from REALIAS
    where ali_name="4";
insert into DONATION
    select donid,"Mom's Spaghetti",561,32 from REALIAS
    where ali_name="4";
insert into DONATION
    select donid,"Larry Cucumber",98,0 from REALIAS
    where ali_name="4";
insert into DONATION
    select donid,"Pa Grape",0,23 from REALIAS
    where ali_name="4";
insert into DONATION
    select donid,"Pineapple",879,3215 from REALIAS
    where ali_name="5";
insert into DONATION
    select donid,"Banana",5,500 from REALIAS
    where ali_name="5";
insert into DONATION
    select donid,"Pa Grape",36,0 from REALIAS
    where ali_name="5";
insert into DONATION
    select donid,"Dehydrated water",0,100 from REALIAS
    where ali_name="5";
insert into DONATION
    select donid,"Junior Asparagus",0,90 from REALIAS
    where ali_name="6";
insert into DONATION
    select donid,"food i",879,50 from REALIAS
    where ali_name="7";
insert into DONATION
    select donid,"food h",879,50 from REALIAS
    where ali_name="7";
insert into DONATION
    select donid,"food g",879,50 from REALIAS
    where ali_name="7";
insert into DONATION
    select donid,"food f",879,50 from REALIAS
    where ali_name="7";
insert into DONATION
    select donid,"food e",879,50 from REALIAS
    where ali_name="7";
insert into DONATION
    select donid,"food d ",879,50 from REALIAS
    where ali_name="7";
insert into DONATION
    select donid,"food c",879,50 from REALIAS
    where ali_name="7";
insert into DONATION
    select donid,"food b",879,50 from REALIAS
    where ali_name="7";
insert into DONATION
    select donid,"Food a",879,50 from REALIAS
    where ali_name="7";
insert into DONATION
    select donid,"Junior Asparagus",800000,0 from REALIAS
    where ali_name="7";
insert into DONATION
    select donid,"Banana",10,50000 from REALIAS
    where ali_name="7";
insert into DONATION
    select donid,"Mom's Spaghetti",5,10 from REALIAS
    where ali_name="7";
insert into DONATION
    select donid,"Junior Asparagus",0,50000 from REALIAS
    where ali_name="8";
insert into DONATION
    select donid,"Banana",300,90 from REALIAS
    where ali_name="8";
insert into DONATION
    select donid,"Pa Grape",0,230 from REALIAS
    where ali_name="8";
insert into DONATION
    select donid,"Jumbo juice",0,10 from REALIAS
    where ali_name="8";
insert into DONATION
    select donid,"Bob tomato",80,0 from REALIAS
    where ali_name="9";
insert into DONATION
    select donid,"Pineapple",940,0 from REALIAS
    where ali_name="9";
insert into DONATION
    select donid,"Candy Corn",668,668 from REALIAS
    where ali_name="10";
insert into DONATION
    select donid,"Icecream",40,40 from REALIAS
    where ali_name="10";
delimiter //
create procedure new_pledge (out outing integer)
begin
    set outing=(select count(*) from REALIAS);
    insert into REALIAS values(UUID(),outing+1);
    set outing=(select count(*) from REALIAS);
end//
create procedure new_pledge_item (in ali integer,in food varchar(20)
                            ,in quantity integer)
begin
    insert into DONATION
        select donid,food,quantity,0 from REALIAS
              where ali_name=ali;
end//
create procedure new_donated (in nam varchar(20),in ali integer,
                              in bank varchar(20),in bool integer)
begin
    if bool=0  then
        insert into DONATED
            select pid,donid,bank from PERSON,REALIAS
                where first_name=nam and ali_name=ali;
    else
        insert into ORG_DONATED
            select nam,donid,bank from REALIAS
                where ali_name=ali;
    end if; 
end//
create procedure update_donation (inout a integer, in food varchar(20), in don_amt integer)
begin
    if a != 0 then
        update DONATION set quantity_donated=don_amt
        where food_type=food and donid in
            (select donid
             from REALIAS
             where ali_name=a);
    else
        call new_pledge(a);
        insert into DONATION
            select donid,food,0,don_amt from REALIAS
                where ali_name=a;
    end if;
end//
delimiter ;