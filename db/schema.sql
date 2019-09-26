CREATE TABLE USER {
    id INT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
} 

CREATE TABLE INVESTOR {
    id INT PRIMARY KEY,
    FOREIGN KEY (id) REFRENCES USER(id)
}

CREATE TABLE HOMEOWNER {
    id INT PRIMARY KEY,
    FOREIGN KEY (id) REFRENCES USER(id)
}

CREATE TABLE CONTRACT {
    id INT PRIMARY KEY,
    user_id: INT,
    sale_amount INT NOT NULL,
    length INT NOT NULL,
    monthly_payment INT NOT NULL,
    FOREIGN KEY (user_id) REFRENCES USER(id)
}

CREATE TABLE INVESTMENT {
    id INT PRIMARY KEY,
    contract_id INT,
    investor_id INT,
    percentage FLOAT,
    for_sale BOOL
}