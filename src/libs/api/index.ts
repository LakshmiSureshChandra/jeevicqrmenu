import { env } from '../env';
import type {
  IUser,
  IDishCategory,
  IDish,
  IDineInCheckout,
  IDineInOrders,
  IDineInTableBookings,
  IDineInTables,
  IReview
} from './types';

export class APISDK {
  private static instance: APISDK;
  private static readonly BASE_URL = env.VITE_API_URL;
  private accessToken: string | null;

  private constructor(accessToken: string | null) {
    this.accessToken = accessToken;
  }

  public static getInstance(
    accessToken?: string | null
  ): APISDK {
    if (!this.instance) {
      this.instance = new APISDK(accessToken ?? null);
    } else if (accessToken !== undefined) {
      this.instance.setAccessToken(accessToken);
    }
    return this.instance;
  }

  public setAccessToken(accessToken: string | null): void {
    this.accessToken = accessToken;
  }

  public async getUser(): Promise<IUser> {
    const response = await fetch(
      `${APISDK.BASE_URL}/auth/user`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get user: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  public async loginRequest(
    countryCode: string,
    phoneNumber: string
  ): Promise<{ message: string }> {
    const response = await fetch(
      `${APISDK.BASE_URL}/auth/login-request`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          country_code: countryCode,
          phone_number: phoneNumber,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to login request: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  public async verifyAccountAccess(
    countryCode: string,
    phoneNumber: string,
    otp: string
  ): Promise<{ message: string }> {
    const response = await fetch(
      `${APISDK.BASE_URL}/auth/verify-account-access`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          country_code: countryCode,
          phone_number: phoneNumber,
          otp,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to verify account access: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  public async getDishCategories(): Promise<IDishCategory[]> {
    const response = await fetch(
      `${APISDK.BASE_URL}/dish/categories`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get dish categories: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  public async getDishCategoryById(
    dishCategoryId: string
  ): Promise<IDishCategory> {
    const response = await fetch(
      `${APISDK.BASE_URL}/dish/categories/${dishCategoryId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get dish category by id: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  public async getDishById(
    dishId: string
  ): Promise<IDish> {
    const response = await fetch(
      `${APISDK.BASE_URL}/dish/i/${dishId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get dish by id: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  public async getDishes(): Promise<IDish[]> {
    const response = await fetch(
      `${APISDK.BASE_URL}/dish/dishes`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get dishes: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  public async getDishesByCategoryId(
    dishCategoryId: string
  ): Promise<IDish[]> {
    const response = await fetch(
      `${APISDK.BASE_URL}/dish/dishes/${dishCategoryId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get dishes by category id: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  public async createDishCategory(
    name: string,
    picture: string
  ): Promise<IDishCategory> {
    const response = await fetch(
      `${APISDK.BASE_URL}/dish/categories`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          name,
          picture,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to create dish category: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // updateDishCategory
  public async updateDishCategory(
    dishCategoryId: string,
    name: string,
    picture: string
  ): Promise<void> {
    const response = await fetch(
      `${APISDK.BASE_URL}/dish/categories/${dishCategoryId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          name,
          picture,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to update dish category: ${response.status} ${response.statusText}`
      );
    }
  }

  // deleteDishCategory
  public async deleteDishCategory(
    dishCategoryId: string
  ): Promise<void> {
    const response = await fetch(
      `${APISDK.BASE_URL}/dish/categories/${dishCategoryId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to delete dish category: ${response.status} ${response.statusText}`
      );
    }
  }

  // createDish
  public async createDish({
    name,
    price,
    dish_category_id,
    is_available,
    is_non_veg,
    meta_data,
    picture
  }: {    name: string;
    price: number;
    picture: string;
    dish_category_id: string;
    is_available: boolean;
    is_non_veg: boolean;
    meta_data: object;}
  ): Promise<IDish> {
    const response = await fetch(
      `${APISDK.BASE_URL}/dish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          name,
          price,
          picture,
          dish_category_id,
          is_available,
          is_non_veg,
          meta_data,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to create dish: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // updateDish
  public async updateDish(
    dishId: string,
    {
      name,
      price,
      picture,
      dish_category_id,
      is_available,
      is_non_veg,
      meta_data
    }: {
      name: string;
      price: number;
      picture: string;
      dish_category_id: string;
      is_available: boolean;
      is_non_veg: boolean;
      meta_data: object;
    }
  ): Promise<void> {
    const response = await fetch(
      `${APISDK.BASE_URL}/dish/${dishId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          name,
          price,
          picture,
          dish_category_id,
          is_available,
          is_non_veg,
          meta_data,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to update dish: ${response.status} ${response.statusText}`
      );
    }
  }

  // deleteDish
  public async deleteDish(dishId: string): Promise<void> {
    const response = await fetch(
      `${APISDK.BASE_URL}/dish/${dishId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to delete dish: ${response.status} ${response.statusText}`
      );
    }
  }

  // getTables
  public async getTables(): Promise<{
    success: boolean;
    data: IDineInTables[];
  }> {
    const response = await fetch(
      `${APISDK.BASE_URL}/dine-in/tables`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get tables: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // getTableById
  public async getTableById(tableId: string): Promise<{
    success: boolean;
    data: IDineInTables;
  }> {
    const response = await fetch(
      `${APISDK.BASE_URL}/dine-in/tables/${tableId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get table: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // getTableByTableNumber
  public async getTableByTableNumber(tableNumber: string): Promise<{
    success: boolean;
    data: IDineInTables;
  }> {
    const response = await fetch(
      `${APISDK.BASE_URL}/dine-in/tables/by-no/${tableNumber}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get table: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // getBooking
  public async getBooking(bookingId: string): Promise<{
    success: boolean;
    data: IDineInTableBookings;
  }> {
    const response = await fetch(
      `${APISDK.BASE_URL}/dine-in/bookings/${bookingId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get booking: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // createBooking
  public async createBooking(
    {
      table_id,
      booking_date,
      booking_time,
      from_time,
      to_time,
      number_of_people,
    }: {
      table_id: string;
      booking_date: string;
      booking_time: string;
      from_time: string;
      to_time: string;
      number_of_people: number;
    }
  ): Promise<{
    success: boolean;
    data: IDineInTableBookings;
  }> {
    const response = await fetch(`${APISDK.BASE_URL}/dine-in/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({
        table_id,
        booking_date,
        booking_time,
        from_time,
        to_time,
        number_of_people,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create booking: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // updateBooking
  public async updateBooking(
    bookingId: string,
    {
      table_id,
      booking_date,
      booking_time,
      from_time,
      to_time,
      number_of_people,
    }: {
      table_id: string;
      booking_date: string;
      booking_time: string;
      from_time: string;
      to_time: string;
      number_of_people: number;
    }
  ): Promise<void> {
    const response = await fetch(`${APISDK.BASE_URL}/dine-in/bookings/${bookingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({
        table_id,
        booking_date,
        booking_time,
        from_time,
        to_time,
        number_of_people,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update booking: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // deleteBooking
  public async deleteBooking(bookingId: string): Promise<void> {
    const response = await fetch(
      `${APISDK.BASE_URL}/dine-in/bookings/${bookingId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to delete booking: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // markBookingAsCancelled
  public async markBookingAsCancelled(bookingId: string): Promise<{
    success: boolean;
  }> {
    const response = await fetch(
      `${APISDK.BASE_URL}/dine-in/bookings/cancel/${bookingId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to mark booking as cancelled: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // markBookingAsCompleted
  public async markBookingAsCompleted(bookingId: string): Promise<{
    success: boolean;
  }> {
    const response = await fetch(
      `${APISDK.BASE_URL}/dine-in/bookings/complete/${bookingId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to mark booking as completed: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // getOrderById
  public async getOrderById(orderId: string): Promise<{
    success: boolean;
    data: IDineInOrders;
  }> {
    const response = await fetch(
      `${APISDK.BASE_URL}/dine-in/orders/${orderId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get order: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // getOrdersByBookingId
  public async getOrdersByBookingId(bookingId: string): Promise<{
    success: boolean;
    data: IDineInOrders[];
  }> {
    const response = await fetch(
      `${APISDK.BASE_URL}/dine-in/orders/booking/${bookingId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get orders: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // getOrdersByUserId
  public async getOrdersByUserId(userId: string): Promise<{
    success: boolean;
    data: IDineInOrders[];
  }> {
    const response = await fetch(
      `${APISDK.BASE_URL}/dine-in/orders/user/${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get orders: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // getOrdersByTableId
  public async getOrdersByTableId(tableId: string): Promise<{
    success: boolean;
    data: IDineInOrders[];
  }> {
    const response = await fetch(
      `${APISDK.BASE_URL}/dine-in/orders/table/${tableId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get orders: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // createOrder
  public async createOrder(orderData: IDineInOrders): Promise<{
    success: boolean;
    data: IDineInOrders;
  }> {
    const response = await fetch(`${APISDK.BASE_URL}/dine-in/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create order: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // markOrderAsCancelled
  public async markOrderAsCancelled(orderId: string): Promise<{
    success: boolean;
  }> {
    const response = await fetch(
      `${APISDK.BASE_URL}/dine-in/orders/cancel/${orderId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to mark order as cancelled: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // getCheckoutById
  public async getCheckoutById(checkoutId: string): Promise<{
    success: boolean;
    data: IDineInCheckout;
  }> {
    const response = await fetch(
      `${APISDK.BASE_URL}/dine-in/checkouts/${checkoutId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get checkout: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // getCheckoutByBookingId
  public async getCheckoutByBookingId(bookingId: string): Promise<{
    success: boolean;
    data: IDineInCheckout;
  }> {
    const response = await fetch(
      `${APISDK.BASE_URL}/dine-in/checkouts/booking/${bookingId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get checkout: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // getCheckoutByUserId
  public async getCheckoutByUserId(userId: string): Promise<{
    success: boolean;
    data: IDineInCheckout;
  }> {
    const response = await fetch(
      `${APISDK.BASE_URL}/dine-in/checkouts/user/${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get checkout: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // getCheckoutByTableId
  public async getCheckoutByTableId(tableId: string): Promise<{
    success: boolean;
    data: IDineInCheckout;
  }> {
    const response = await fetch(
      `${APISDK.BASE_URL}/dine-in/checkouts/table/${tableId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get checkout: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // createUserEndCheckout
  public async createUserEndCheckout(booking_id: string): Promise<{
    success: boolean;
    data: IDineInCheckout;
  }> {
    const response = await fetch(`${APISDK.BASE_URL}/dine-in/checkouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({
        booking_id,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create checkout: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // getAvailableTables
  public async getAvailableTables(fromTime: string, toTime: string): Promise<{
    success: boolean;
    data: IDineInTables[];
  }> {
    const response = await fetch(
      `${APISDK.BASE_URL}/dine-in/tables/available?fromTime=${fromTime}&toTime=${toTime}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get available tables: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // getCheckouts
  public async getCheckouts(): Promise<{
    success: boolean;
    data: IDineInCheckout[];
  }> {
    const response = await fetch(`${APISDK.BASE_URL}/dine-in/checkouts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to get checkouts: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // updateCheckout
  public async updateCheckout(
    checkoutId: string,
    checkoutData: IDineInCheckout
  ): Promise<{
    success: boolean;
    data: IDineInCheckout;
  }> {
    const response = await fetch(`${APISDK.BASE_URL}/dine-in/checkouts/${checkoutId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify(checkoutData),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update checkout: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // deleteCheckout
  public async deleteCheckout(checkoutId: string): Promise<{
    success: boolean;
  }> {
    const response = await fetch(`${APISDK.BASE_URL}/dine-in/checkouts/${checkoutId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to delete checkout: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // getOrders
  public async getOrders(): Promise<{
    success: boolean;
    data: IDineInOrders[];
  }> {
    const response = await fetch(`${APISDK.BASE_URL}/dine-in/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to get orders: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // markOrderAsReady
  public async markOrderAsReady(orderId: string): Promise<{
    success: boolean;
  }> {
    const response = await fetch(
      `${APISDK.BASE_URL}/dine-in/orders/ready/${orderId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to mark order as ready: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // markOrderAsServed
  public async markOrderAsServed(orderId: string): Promise<{
    success: boolean;
  }> {
    const response = await fetch(
      `${APISDK.BASE_URL}/dine-in/orders/serve/${orderId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to mark order as served: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // updateOrder
  public async updateOrder(orderId: string, data: Partial<IDineInOrders>): Promise<{
    success: boolean;
    data: IDineInOrders;
  }> {
    const response = await fetch(`${APISDK.BASE_URL}/dine-in/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update order: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // deleteOrder
  public async deleteOrder(orderId: string): Promise<{
    success: boolean;
  }> {
    const response = await fetch(`${APISDK.BASE_URL}/dine-in/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to delete order: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // getBookings
  public async getBookings(): Promise<{
    success: boolean;
    data: IDineInTableBookings[];
  }> {
    const response = await fetch(`${APISDK.BASE_URL}/dine-in/bookings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to get bookings: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // createTable
  public async createTable(
    {
      table_number,
      capacity,
      meta_data,
  }: {
      table_number: string;
      capacity: number;
      meta_data: object;
  }): Promise<{
    success: boolean;
    data: IDineInTables;
  }> {
    const response = await fetch(`${APISDK.BASE_URL}/dine-in/tables`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({
        table_number,
        capacity,
        meta_data,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create table: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // updateTable
  public async updateTable(
    tableId: string,
    {
      table_number,
      capacity,
      meta_data,
    }: {
      table_number: string;
      capacity: number;
      meta_data: object;
    }
  ): Promise<{
    success: boolean;
    data: IDineInTables;
  }> {
    const response = await fetch(`${APISDK.BASE_URL}/dine-in/tables/${tableId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({
        table_number,
        capacity,
        meta_data,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update table: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // deleteTable
  public async deleteTable(tableId: string): Promise<{
    success: boolean;
  }> {
    const response = await fetch(`${APISDK.BASE_URL}/dine-in/tables/${tableId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to delete table: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // getReviewsByDish
  public async getReviewsByDish(dishId: string): Promise<{
    success: boolean;
    data: IReview[];
  }> {
    const response = await fetch(`${APISDK.BASE_URL}/reviews/d/${dishId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to get reviews by dish: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

   // getReviewsByProduct
   public async getReviewsByProduct(productId: string): Promise<{
    success: boolean;
    data: IReview[];
  }> {
    const response = await fetch(`${APISDK.BASE_URL}/reviews/p/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to get reviews by dish: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // getReview
  public async getReview(reviewId: string): Promise<{
    success: boolean;
    data: IReview;
  }> {
    const response = await fetch(`${APISDK.BASE_URL}/reviews/${reviewId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to get review: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // createReview
  public async createReview(
    {
      product_id,
      dish_id,
      rating,
      comment,
      meta_data,
    }: {
      product_id?: string;
      dish_id?: string;
      rating: number;
      comment: string;
      meta_data: object;
    }
  ): Promise<{
    message: string;
  }> {
    const response = await fetch(`${APISDK.BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({
        product_id,
        dish_id,
        rating,
        comment,
        meta_data,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create review: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // deleteReview
  public async deleteReview(reviewId: string): Promise<{
    message: string;
  }> {
    const response = await fetch(`${APISDK.BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to delete review: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // updateReview
  public async updateReview(
    reviewId: string,
    {
      rating,
      comment,
      meta_data,
    }: {
      rating?: number;
      comment?: string;
      meta_data?: object;
    }
  ): Promise<{
    success: boolean;
    data: IReview;
  }> {
    const response = await fetch(`${APISDK.BASE_URL}/reviews/${reviewId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({
        rating,
        comment,
        meta_data,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update review: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // getAverageRatingForDish
  public async getAverageRatingForDish(dishId: string): Promise<{
    success: boolean;
    data: {
      average_rating: number;
    };
  }> {
    const response = await fetch(`${APISDK.BASE_URL}/reviews/avg/d/${dishId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to get average rating for dish: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  // getAverageRatingForProduct
  public async getAverageRatingForProduct(
    productId: string
  ): Promise<{
    success: boolean;
    data: {
      average_rating: number;
    };
  }> {
    const response = await fetch(
      `${APISDK.BASE_URL}/reviews/avg/p/${productId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get average rating for product: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }
}
