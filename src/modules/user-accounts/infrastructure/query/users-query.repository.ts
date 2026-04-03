import { Injectable, NotFoundException } from '@nestjs/common';
import { MeViewDto, UserViewDto } from '../../dto/user/user-view.dto';
import { GetUsersQueryParams } from '../../dto/user/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

import { User, type UserModelType } from '../../domain/user/user.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findMeByIdOrNotFindFail(id: string): Promise<MeViewDto> {
    const user = await this.UserModel.findOne({
      _id: id,
      deletedAt: null,
    }).select('name email role lang imgUrl telephone isSubscribed linkedIdentities');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return MeViewDto.mapToView(user);
  }

  async findByIdOrNotFoundFail(id: string): Promise<UserViewDto> {
    const user = await this.UserModel.findOne({ _id: id, deletedAt: null });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserViewDto.mapToView(user);
  }

  async getAll(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const filter: any = {
      deletedAt: null,
    };

    if (query.searchLoginTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        name: { $regex: query.searchLoginTerm, $options: 'i' },
      });
    }

    if (query.searchEmailTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        email: { $regex: query.searchEmailTerm, $options: 'i' },
      });
    }

    const users = await this.UserModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.UserModel.countDocuments(filter);

    const items = users.map(UserViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
