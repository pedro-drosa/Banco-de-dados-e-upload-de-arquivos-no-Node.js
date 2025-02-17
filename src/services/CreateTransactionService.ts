import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const categoriesRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('you do not have enough balance', 400);
    }

    let currentCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!currentCategory) {
      currentCategory = categoriesRepository.create({ title: category });
      await categoriesRepository.save(currentCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: currentCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
