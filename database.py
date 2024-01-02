import psycopg2
import csv
from psycopg2 import OperationalError

def export_table_to_csv(table_name, cursor, csv_writer):
    # Get column names for the current table
    cursor.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table_name}'")
    column_names = [row[0] for row in cursor.fetchall()]

    # Write header with column names
    csv_writer.writerow(column_names)

    # Retrieve data from the table
    cursor.execute(f'SELECT * FROM {table_name}')

    # Fetch all the results
    data = cursor.fetchall()

    # Write data to CSV
    for row in data:
        csv_writer.writerow(list(row))

def export_tables_to_csv(tables, cursor):
    for table in tables:
        # Open CSV file for writing
        with open(f'{table}.csv', 'w', newline='') as csv_file:
            csv_writer = csv.writer(csv_file)

            # Call a separate function to export each table
            export_table_to_csv(table, cursor, csv_writer)

        print(f'Export to {table}.csv successful!')

def test_postgres_connection():
    try:
        conn = psycopg2.connect(
            dbname='hc23_24_redocelot',
            user='hc23-24',
            password='Hack_camp',
            host='poseidon.salford.ac.uk',
            port='5432'
        )

        cursor = conn.cursor()

        # tables to export
        tables_to_export = ['branches', 'commits', 'files', 'languages', 'licenses', 'repositories', 'repository_languages', 'users']

        # Call a function to export tables
        export_tables_to_csv(tables_to_export, cursor)

        cursor.close()
        conn.close()

    except OperationalError as e:
        print(f"Error: {e}")

test_postgres_connection()
