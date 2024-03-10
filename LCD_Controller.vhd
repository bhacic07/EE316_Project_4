library IEEE;
use IEEE.STD_LOGIC_1164.ALL;
use IEEE.std_logic_unsigned.all;

entity LCD_Controller is							-- Modified from SPI usr logic from last year
    Port ( iclk : in STD_LOGIC;
			  Rx_data_valid : std_logic; 
           dataIn : in STD_LOGIC_VECTOR (7 downto 0);
			  FirstLineInput: out std_LOGIC_VECTOR(127 downto 0);
			  SecondLineInput: out std_LOGIC_VECTOR(127 downto 0)
			  );
end LCD_Controller;

architecture Behavioral of LCD_Controller is

-----------------------------------------------------------------------

signal char    : std_logic_vector(7 downto 0); 
signal input   :  std_logic_vector(127 downto 0) := X"00000000000000000000000000000000"; 
signal input0  : std_logic_vector(7 downto 0); 
signal input1  : std_logic_vector(7 downto 0); 
signal input2  : std_logic_vector(7 downto 0); 
signal input3  : std_logic_vector(7 downto 0); 
signal input4  : std_logic_vector(7 downto 0); 
signal input5  : std_logic_vector(7 downto 0); 
signal input6  : std_logic_vector(7 downto 0); 
signal input7  : std_logic_vector(7 downto 0); 
signal input8  : std_logic_vector(7 downto 0); 
signal input9  : std_logic_vector(7 downto 0); 
signal input10 : std_logic_vector(7 downto 0); 
signal input11 : std_logic_vector(7 downto 0); 
signal input12 : std_logic_vector(7 downto 0); 
signal input13 : std_logic_vector(7 downto 0); 
signal input14 : std_logic_vector(7 downto 0); 

-----------------------------------------------------------------------
begin 

process(Rx_data_valid, dataIn, char)
begin  
if dataIn(7 downto 6) = 1 then 
	if Rx_data_valid = '1' then
		char    <= dataIn; 
		input0  <= char;
		input1  <= input0; 
		input2  <= input1; 
		input3  <= input2; 
		input4  <= input3;
		input5  <= input4; 
		input6  <= input5; 
		input7  <= input6; 
		input8  <= input7;
		input9  <= input8; 
		input10 <= input9; 
		input11 <= input10; 
		input12 <= input11;
		input13 <= input12; 
		input14 <= input13; 
		
		input <=  input14 & input13 & input12 & input11 & input10 & input9 & input8 & input7 & input6 & input5 & input4 & input3 & input2 & input1 & input0 & char;  
		
		if char = X"5F" and dataIn(7 downto 6) = 1 then 
			secondLineInput <= input;
		else 
			firstLineInput <= input;
		end if; 
	end if; 
end if; 
end process;  

	
end Behavioral; 

