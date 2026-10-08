import { Model, ModelStatic, Transaction, FindOptions, WhereOptions } from 'sequelize';

export class BaseRepository<T extends Model> {
    protected model: ModelStatic<T>;

    constructor(model: ModelStatic<T>) {
        this.model = model;
    }

    async create(data: any, transaction?: Transaction): Promise<T> {
        return await this.model.create(data, { transaction });
    }

    async findById(id: string, options?: FindOptions, transaction?: Transaction): Promise<T | null> {
        return await this.model.findByPk(id, { ...options, transaction });
    }

    async findOne(options: FindOptions, transaction?: Transaction): Promise<T | null> {
        return await this.model.findOne({ ...options, transaction });
    }

    async findAll(options?: FindOptions, transaction?: Transaction): Promise<T[]> {
        return await this.model.findAll({ ...options, transaction });
    }

    async update(data: Partial<T>, where: WhereOptions<T>, transaction?: Transaction): Promise<[number]> {
        return await this.model.update(data, { where, transaction });
    }

    async delete(where: WhereOptions<T>, transaction?: Transaction): Promise<number> {
        return await this.model.destroy({ where, transaction });
    }
}
