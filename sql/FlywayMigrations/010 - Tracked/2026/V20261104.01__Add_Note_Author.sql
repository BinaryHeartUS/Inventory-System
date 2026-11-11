alter table Note
    add column Author_ID integer null
    references Volunteer(ID) on delete set null; -- if someones account is gone, keep the note but remove attribution ig?

-- index?
