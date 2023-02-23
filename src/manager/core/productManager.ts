import { Product, Perimeter, User } from "@entity/index";
import AbstractManagerWithRepository from "@manager/AbstractManagerWithRepository";
import { validateProduct } from "@root/controller/core/helpers/validateProduct";
import { ProductRepository } from "@root/repository/index";

class ProductManager extends AbstractManagerWithRepository<
  Product,
  ProductRepository
> {
  protected entityClass = Product;
  protected repositoryClass = ProductRepository;

  async createNew(
    productInfo: {
      name: string;
      description: string | null;
      quantity: number | null;
      perimeter: Perimeter;
    },
    flush: boolean = false
  ): Promise<Product> {
    const product = this.instance();
    product.perimeter = productInfo.perimeter;
    product.name = productInfo.name;
    if (productInfo.description) {
      product.description = productInfo.description;
    }
    if (productInfo.quantity) {
      product.quantity = productInfo.quantity;
    }

    if (flush) {
      await this.em.save(product);
    }

    return product;
  }

  async update(
    product: Product,
    productInfo: {
      name: string;
      description: string | null;
      quantity: number | null;
    },
    flush: boolean = false
  ): Promise<Product> {
    this.em.merge(Product, product, {
      ...productInfo,
    });

    if (flush) {
      await this.em.save(product);
    }

    return product;
  }

  async archive(product: Product, flush: boolean = false): Promise<Product> {
    this.em.merge(Product, product, {
      archivedDate: new Date(),
    });

    if (flush) {
      await this.em.save(product);
    }

    return product;
  }
  async archiveMultiple(listIds: number[], user: User){
    await Promise.all(listIds.map(async id => {
       const product = await validateProduct(id, user!);
       await this.archive(product, true);
       return product;
     }));
   }
 

  async unarchive(product: Product, flush: boolean = false): Promise<Product> {
    this.em.merge(Product, product, {
      archivedDate: null,
    });

    if (flush) {
      await this.em.save(product);
    }

    return product;
  }
}

export default new ProductManager();
