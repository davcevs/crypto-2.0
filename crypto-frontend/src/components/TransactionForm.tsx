import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const transactionSchema = z.object({
  type: z.enum(["BUY", "SELL"]),
  symbol: z.string().min(1),
  amount: z.number().positive(),
  price: z.number().positive(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => Promise<void>;
  isLoading: boolean;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <select {...register("type")} className="w-full p-2 border rounded">
          <option value="BUY">Buy</option>
          <option value="SELL">Sell</option>
        </select>
        {errors.type && <p className="text-red-500">{errors.type.message}</p>}
      </div>

      <div>
        <input
          {...register("symbol")}
          placeholder="Symbol (e.g., BTC)"
          className="w-full p-2 border rounded"
        />
        {errors.symbol && (
          <p className="text-red-500">{errors.symbol.message}</p>
        )}
      </div>

      <div>
        <input
          {...register("amount", { valueAsNumber: true })}
          type="number"
          step="any"
          placeholder="Amount"
          className="w-full p-2 border rounded"
        />
        {errors.amount && (
          <p className="text-red-500">{errors.amount.message}</p>
        )}
      </div>

      <div>
        <input
          {...register("price", { valueAsNumber: true })}
          type="number"
          step="any"
          placeholder="Price"
          className="w-full p-2 border rounded"
        />
        {errors.price && <p className="text-red-500">{errors.price.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full p-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
      >
        {isLoading ? "Processing..." : "Submit Transaction"}
      </button>
    </form>
  );
};
