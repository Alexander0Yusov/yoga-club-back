import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Connection } from 'mongoose';

@ApiTags('Testing')
@Controller('testing')
export class TestingController {
  constructor(
    @InjectConnection() private readonly databaseConnection: Connection,
  ) {
    console.log('TestingController зарегистрирован');
  }

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete all data (testing only)' })
  @ApiResponse({ status: 204, description: 'All data deleted' })
  async deleteAll() {
    console.log('DELETE /api/testing/all-data вызван');

    const collections = await this.databaseConnection.listCollections();

    const promises = collections.map((collection) =>
      this.databaseConnection.collection(collection.name).deleteMany({}),
    );
    await Promise.all(promises);

    return {
      status: 'succeeded',
    };
  }
}
