# Quick to filter and merge CSV files from Retrosheet


import pandas as pd

def filter_csv_by_season(input_file, output_file, cutoff_year=2015, season_column="yearID"):
    """
    Filters a CSV file, removing rows where the season (yearID) is earlier than a cutoff year.

    Args:
        input_file: Path to the input CSV file.
        output_file: Path to save the filtered CSV file.
        cutoff_year: The year to filter by (rows with years before this are removed). Defaults to 2015.
        season_column: The name of the column containing the season/year. Defaults to "yearID".

    Raises:
        FileNotFoundError: If the input file does not exist.
        KeyError: If the specified season column does not exist in the CSV.
        pd.errors.ParserError: If there is an issue parsing the CSV file.
    """
    try:
        df = pd.read_csv(input_file)
    except FileNotFoundError:
        raise FileNotFoundError(f"Input file '{input_file}' not found.")
    except pd.errors.ParserError as e:
        raise pd.errors.ParserError(f"Error parsing CSV file: {e}")

    try:
      if df.empty:
          print("Warning: Input CSV is empty. No filtering performed.")
          df.to_csv(output_file, index=False)
          return
      
      df = df[df[season_column] >= cutoff_year] # Filter for seasons >= cutoff
      
      if df.empty:
        print("Warning: No data remaining after filtering. Creating empty CSV file.")
        df.to_csv(output_file, index=False)
        return
        
      df.to_csv(output_file, index=False)
      print(f"Filtered data saved to '{output_file}'.")

    except KeyError:
        raise KeyError(f"Column '{season_column}' not found in the CSV file.")

def join_datasets(files, output_file, chunksize=10000):
    # Initialize an empty DataFrame for the merged result
    merged_df = None

    for file in files:
        for chunk in pd.read_csv(file, chunksize=chunksize):
            if merged_df is None:
                merged_df = chunk
            else:
                
                merged_df = pd.concat([merged_df, chunk], axis=1)

                
                merged_df = merged_df.loc[:, ~merged_df.columns.duplicated()]

            
            if merged_df is not None:
                merged_df.to_csv(output_file, mode='a', header=not pd.io.common.file_exists(output_file), index=False)
                merged_df = None  # Reset merged_df to process the next chunk

    print(f"Merged data saved to '{output_file}'.")



# input_csv_file = "csvdownloads/\/allplayers.csv"  
# output_csv_file = "players-2023-24.csv" 

# try:
#     filter_csv_by_season(input_csv_file, output_csv_file, cutoff_year=20230101, season_column="season")
# except (FileNotFoundError, KeyError, pd.errors.ParserError) as e:
#     print(f"An error occurred: {e}")


files = [  
    "plays-2023-24.csv",
    "gameinfo-2023-24.csv",
    "batting-2023-24.csv",
    "pitching-2023-24.csv",
    "fields-2023-24.csv"         
]
output_file = "all-dataset-2023-24.csv"  # Replace with your desired output file name

join_datasets(files, output_file)