import { ApiProperty } from '@nestjs/swagger';
import { Prop } from '@nestjs/mongoose';

export class SeoMetadata {
  @ApiProperty({ example: 'Йога Тур в горы', required: false })
  @Prop()
  public title?: string;

  @ApiProperty({ example: 'Лучшая практика в вашей жизни...', required: false })
  @Prop()
  public description?: string;

  @ApiProperty({ example: 'https://cloudinary.com/seo.jpg', required: false })
  @Prop()
  public imageUrl?: string;

  @ApiProperty({ example: 'Йога в горах', required: false })
  @Prop()
  public alt?: string;

  constructor(partial?: Partial<SeoMetadata>) {
    if (partial) {
      this.title = partial.title;
      this.description = partial.description;
      this.imageUrl = partial.imageUrl;
      this.alt = partial.alt;
    }
  }
}
