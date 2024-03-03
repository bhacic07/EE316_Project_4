LIBRARY ieee;
USE ieee.std_logic_1164.ALL;
USE ieee.std_logic_unsigned.ALL;

ENTITY top_level IS
  PORT (
    iclk           : IN  STD_LOGIC;
    ps2_clk_f      : IN  STD_LOGIC;
    ps2_data_f     : IN  STD_LOGIC;
    ps2_code_new_f : OUT STD_LOGIC;
    ps2_code_f     : OUT STD_LOGIC_VECTOR(7 DOWNTO 0)
  );
END top_level;

ARCHITECTURE behavior OF top_level IS
  -- Declare instances of the debounce, ps2_keyboard, and ps2_lut components
  COMPONENT debounce
    GENERIC (
      counter_size : INTEGER := 19
    );
    PORT (
      clk    : IN  STD_LOGIC;
      button : IN  STD_LOGIC;
      result : OUT STD_LOGIC
    );
  END COMPONENT;

  COMPONENT ps2_keyboard
    GENERIC (
      clk_freq              : INTEGER := 50_000_000;
      debounce_counter_size : INTEGER := 8
    );
    PORT (
      clk          : IN  STD_LOGIC;
      ps2_clk      : IN  STD_LOGIC;
      ps2_data     : IN  STD_LOGIC;
      ps2_code_new : OUT STD_LOGIC;
      ps2_code     : OUT STD_LOGIC_VECTOR(7 DOWNTO 0)
    );
  END COMPONENT;

  COMPONENT ps2_lut
    GENERIC (
      clk_freq                  : INTEGER := 50_000_000;
      ps2_debounce_counter_size : INTEGER := 8
    );
    PORT (
      clk        : IN  STD_LOGIC;
      ps2_clk    : IN  STD_LOGIC;
      ps2_data   : IN  STD_LOGIC;
      ascii_new  : OUT STD_LOGIC;
      ascii_code : OUT STD_LOGIC_VECTOR(6 DOWNTO 0)
    );
  END COMPONENT;

  -- Signal declarations
  SIGNAL debounce_result   : STD_LOGIC;
  SIGNAL ps2_code_new      : STD_LOGIC;
  SIGNAL ps2_code          : STD_LOGIC_VECTOR(7 DOWNTO 0);
  SIGNAL ascii_new         : STD_LOGIC;
  SIGNAL ps2_code_internal : STD_LOGIC_VECTOR(6 DOWNTO 0);

BEGIN
  -- Instantiate the debounce component
  debounce_inst : debounce
    GENERIC MAP (
      counter_size => 19
    )
    PORT MAP (
      clk    => iclk,
      button => ps2_data_f,
      result => debounce_result
    );

  -- Instantiate the ps2_keyboard component
  ps2_keyboard_inst : ps2_keyboard
    GENERIC MAP (
      clk_freq              => 50_000_000,
      debounce_counter_size => 8
    )
    PORT MAP (
      clk          => iclk,
      ps2_clk      => ps2_clk_f,
      ps2_data     => debounce_result,
      ps2_code_new => ps2_code_new,
      ps2_code     => ps2_code
    );

  -- Instantiate the ps2_lut component
  ps2_lut_inst : ps2_lut
    GENERIC MAP (
      clk_freq                  => 50_000_000,
      ps2_debounce_counter_size => 8
    )
    PORT MAP (
      clk        => iclk,
      ps2_clk    => ps2_clk_f,
      ps2_data   => debounce_result,
      ascii_new  => ascii_new,
      ascii_code => ps2_code_internal
    );

  -- Output the PS2 code from ps2_lut component
  ps2_code_f     <= ps2_code;
  ps2_code_new_f <= ps2_code_new;

END behavior;
