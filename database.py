import psycopg2
import csv

from psycopg2 import OperationalError

def test_postgres_connection():
    try:
        # Replace with your actual database connection details
        conn = psycopg2.connect(
            dbname='hc23_24_redocelot',
            user='hc23-24',
            password='Hack_camp',
            host='poseidon.salford.ac.uk',
            port='5432'
        )
        
        cursor = conn.cursor()

        #list of tables
        tables = ['branches', 'commits', 'files', 'languages', 'licenses', 'repositories', 'repository_languages', 'users']

        #open CSV for writing
        with open('redocelot.csv', 'w', newline='') as csv_file:
            csv_writer = csv.writer(csv_file)

            for table in tables:
                # Get column names for the current table
                cursor.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table}'")
                column_names = [row[0] for row in cursor.fetchall()]

                # Write header with column names
                csv_writer.writerow(['Table'] + column_names)

                # Execute a query to retrieve data from the table
                cursor.execute(f'SELECT * FROM {table}')

                # Fetch all the results
                data = cursor.fetchall()

                # Write data to CSV
                for row in data:
                    csv_writer.writerow([table] + list(row))
        print('Export to CSV successful!')

        cursor.close()
        conn.close()

    except OperationalError as e:
        print(f"Error: {e}")

        
# Call the function to test the connection
test_postgres_connection()
