import { ApiProperty } from '@nestjs/swagger';

/**
 * Details of a single row validation failure during CSV import.
 */
export class ImportErrorDetail {
  @ApiProperty({ description: 'Row index in the CSV file (1-based)', example: 3 })
  row: number;

  @ApiProperty({
    description: 'Specific validation or parsing failure message',
    example: 'Amount must be greater than zero',
  })
  message: string;
}

/**
 * Summary response returned after processing a CSV subscription import.
 */
export class CsvImportResponseDto {
  @ApiProperty({ description: 'Total number of data rows parsed from the CSV', example: 5 })
  totalRows: number;

  @ApiProperty({ description: 'Number of rows successfully imported into the database', example: 3 })
  imported: number;

  @ApiProperty({ description: 'Number of rows rejected due to validation errors', example: 2 })
  rejected: number;

  @ApiProperty({
    description: 'Detailed list of rejected rows and their error causes',
    type: [ImportErrorDetail],
  })
  errors: ImportErrorDetail[];
}
